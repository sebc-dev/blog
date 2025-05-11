# Story 2.9: Persistance et Détection de la Préférence de Langue

**Status:** Draft

## Goal & Context

**User Story:** En tant qu'Utilisateur, je veux avoir ma préférence de langue (choisie via sélecteur) mémorisée et appliquée lors des visites suivantes (détection et persistance) afin d'avoir une expérience utilisateur plus fluide en arrivant directement sur sa langue préférée.

**Context:** Cette story de l'Epic 2 améliore l'expérience utilisateur bilingue en mémorisant le choix de langue. Elle s'appuie sur le routage i18n (Story 2.3) et le sélecteur de langue global (Story 2.6).

## Detailed Requirements

Mettre en place un middleware Astro (`src/middleware.ts`) pour la détection initiale de la langue au niveau serveur (basée sur un cookie, ou l'`Accept-Language` header) et effectuer une redirection si nécessaire. Côté client, lorsque l'utilisateur choisit une langue via le sélecteur, stocker cette préférence dans `localStorage` et dans un cookie. Le cookie sera lu par le middleware lors des requêtes suivantes. La logique de redirection doit être robuste pour éviter les boucles.

## Acceptance Criteria (ACs)

- AC1: Un fichier `frontend/src/middleware.ts` est créé et configuré pour s'exécuter sur les requêtes.
- AC2: Le middleware tente de détecter la langue préférée de l'utilisateur en inspectant :
    1. Un cookie spécifique (ex: `preferred_lang`).
    2. L'en-tête `Accept-Language` du navigateur.
- AC3: Si une langue préférée détectée (et supportée) est différente de la locale de l'URL actuelle, et que la page n'est pas déjà une redirection, le middleware effectue une redirection HTTP 302 (ou 307) vers l'URL correcte préfixée par la langue.
- AC4: Le script du `LanguageSwitcherGlobal.astro` (ou un script global) est modifié pour :
    - Écrire la langue sélectionnée par l'utilisateur dans `localStorage`.
    - Écrire la langue sélectionnée par l'utilisateur dans un cookie (ex: `preferred_lang`).
- AC5: Lors d'une visite ultérieure (nouvelle session ou rechargement), si un cookie `preferred_lang` valide existe, le middleware redirige l'utilisateur vers cette langue dès la première requête (si pas déjà sur cette langue).
- AC6: La logique de redirection évite les boucles infinies.
- AC7: La documentation (`docs/bilinguisme/gestion-contenu.md` Section 6.2) est mise à jour.

## Technical Implementation Context

**Guidance:** Utiliser l'API Middleware d'Astro. Pour le cookie, utiliser les APIs navigateur ou une petite librairie JS.

- **Relevant Files:**
  - Files to Create:
    - `frontend/src/middleware.ts`
  - Files to Modify:
    - `frontend/src/components/common/LanguageSwitcherGlobal.astro` (ou le script JS associé)
    - `docs/bilinguisme/gestion-contenu.md`
  - _(Hint: Consulter la documentation Astro sur les Middlewares. Se référer à `docs/bilinguisme/gestion-contenu.md` Section 6.2.)_

- **Key Technologies:**
  - Astro (Middleware, API `Astro.cookies`)
  - JavaScript (pour `localStorage` et la gestion des cookies côté client)
  - _(Hint: Voir `docs/teck-stack.md`)_

- **API Interactions / SDK Usage:**
  - Non applicable pour cette story.

- **UI/UX Notes:**
  - La redirection doit être rapide et transparente pour l'utilisateur.
  - Assure une expérience utilisateur plus personnalisée.

- **Data Structures:**
  - Stockage simple clé-valeur (`localStorage`, cookie).

- **Environment Variables:**
  - Non applicable pour cette story.

- **Coding Standards Notes:**
  - La logique du middleware doit être concise et performante.
  - La gestion des cookies doit être conforme aux bonnes pratiques (ex: SameSite, Secure si HTTPS).
  - _(Hint: Voir `docs/normes-codage.md`)_

## Tasks / Subtasks

- [ ] Créer `frontend/src/middleware.ts`:
    ```typescript
    // frontend/src/middleware.ts
    import { defineMiddleware } from 'astro:middleware';
    import { ursprüng } from 'astro:i18n'; // Pour accéder à la config i18n

    const i18nConfig = ursprüng; // Accès à la config i18n (defaultLocale, locales)

    export const onRequest = defineMiddleware(async (context, next) => {
      const { cookies, request, redirect, locals } = context;
      const url = new URL(request.url);

      // Éviter le traitement pour les assets ou les fichiers API
      if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/api/')) {
        return next();
      }
      
      // Extraire la locale de l'URL actuelle
      const pathSegments = url.pathname.split('/').filter(Boolean);
      const currentUrlLocale = i18nConfig.locales.includes(pathSegments[0]) ? pathSegments[0] : null;

      let preferredLang = cookies.get('preferred_lang')?.value;

      // Si pas de cookie, essayer de déduire de Accept-Language (simplifié)
      if (!preferredLang) {
        const acceptLanguage = request.headers.get('accept-language');
        if (acceptLanguage) {
          const langs = acceptLanguage.split(',').map(lang => lang.split(';')[0].toLowerCase().split('-')[0]);
          preferredLang = langs.find(lang => i18nConfig.locales.includes(lang));
        }
      }
      
      // Utiliser la langue par défaut si aucune préférence n'est trouvée ou supportée
      preferredLang = preferredLang && i18nConfig.locales.includes(preferredLang) ? preferredLang : i18nConfig.defaultLocale;

      // Si l'URL n'a pas de préfixe de langue valide OU si le préfixe est différent de la langue préférée
      // ET que nous ne sommes pas déjà sur la bonne URL préfixée par la langue préférée.
      // Assurer que `prefixDefaultLocale` est bien `true` dans la config i18n.
      if (i18nConfig.routing.prefixDefaultLocale && (!currentUrlLocale || currentUrlLocale !== preferredLang)) {
        // Construire la nouvelle URL avec la langue préférée
        // Si currentUrlLocale existe (ex: /fr/blog) et preferredLang est 'en', on veut /en/blog
        // Si currentUrlLocale n'existe pas (ex: /blog, ce qui ne devrait pas arriver avec prefixDefaultLocale:true)
        // ou si currentUrlLocale est la defaultLocale mais qu'on n'a pas le préfixe (ex: / au lieu de /en/)
        
        let newPathname = url.pathname;
        if (currentUrlLocale) { // Remplacer la locale existante
            newPathname = url.pathname.replace(`/${currentUrlLocale}`, `/${preferredLang}`);
        } else { // Ajouter la locale préférée comme préfixe
            newPathname = `/${preferredLang}${url.pathname.startsWith('/') ? '' : '/'}${url.pathname}`;
        }
        
        // Éviter les doubles slashs au cas où pathname est juste "/"
        newPathname = newPathname.replace(/\/\//g, '/');


        if (newPathname !== url.pathname) {
           // Pour éviter les boucles si la redirection elle-même est sur la même page cible (par exemple, pour l'index)
           const destinationUrl = new URL(newPathname, url.origin);
           if (destinationUrl.href !== url.href) {
               return redirect(newPathname, 302); // 302 Found (temporaire) ou 307
           }
        }
      }
      
      // Stocker la langue pour usage dans les pages/layouts via locals
      locals.currentLang = currentUrlLocale || preferredLang;

      return next();
    });
    ```
- [ ] Modifier `frontend/src/components/common/LanguageSwitcherGlobal.astro` (ou son script JS associé) :
    - Au clic sur un bouton de langue, en plus de la navigation, enregistrer la langue choisie :
        - Dans `localStorage.setItem('preferred_lang', selectedLang);`
        - Dans un cookie : `document.cookie = \`preferred_lang=\${selectedLang};path=/;max-age=\${365 * 24 * 60 * 60};SameSite=Lax\`;` (utiliser `Astro.cookies.set` si dans un endpoint ou middleware, mais ici c'est client-side).
- [ ] Tester le scénario complet :
    1. Visiter le site pour la première fois (pas de cookie `preferred_lang`). Le middleware devrait essayer de deviner à partir de `Accept-Language` ou utiliser la `defaultLocale` et rediriger si nécessaire.
    2. Utiliser le sélecteur pour changer de langue (ex: passer au français).
    3. Vérifier que `localStorage` et le cookie `preferred_lang` sont mis à jour avec "fr".
    4. Fermer l'onglet/navigateur, puis rouvrir le site en accédant à la racine (ex: `http://localhost:4321/`).
    5. Vérifier que le middleware lit le cookie et redirige automatiquement vers `/fr/`.
- [ ] S'assurer que la redirection n'entre pas en conflit avec d'autres redirections et ne crée pas de boucle.
- [ ] Mettre à jour `docs/bilinguisme/gestion-contenu.md` (Section 6.2).

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.
- **Manual/Browser Testing (avec suppression de cookies/localStorage entre les tests):**
  - **Scénario 1 (Première visite):** Supprimer cookies et localStorage. Configurer le navigateur pour préférer le français dans `Accept-Language`. Visiter `http://localhost:4321/`. S'attendre à être redirigé vers `/fr/`.
  - **Scénario 2 (Choix utilisateur):** Sur `/fr/`, utiliser le sélecteur pour passer à `/en/`. Vérifier que le cookie `preferred_lang` est `en`.
  - **Scénario 3 (Visite suivante):** Fermer le navigateur. Le rouvrir. Visiter `http://localhost:4321/`. S'attendre à être redirigé vers `/en/` (à cause du cookie).
  - **Scénario 4 (Navigation directe):** Visiter directement `/fr/blog/un-article`. Le middleware ne doit pas rediriger si le cookie est `en`, car l'utilisateur a explicitement choisi une URL. (Le comportement exact ici peut être discuté : est-ce que la préférence du cookie outrepasse toujours l'URL directe, ou seulement pour la racine ?) *Note : Le middleware actuel redirigera si `currentUrlLocale !== preferredLang`. Il faudra peut-être affiner pour ne rediriger que depuis la racine ou si pas de locale dans l'URL.* Pour l'AC3, on assume une redirection si la langue de l'URL n'est pas la langue préférée, même pour les pages profondes.
- _(Hint: Voir `docs/strategie-tests.md`)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed. La logique de redirection dans le middleware peut être complexe à cause des différents cas (racine, page profonde, déjà la bonne langue, etc.) et nécessite des tests approfondis.}
- **Change Log:**
  - Initial Draft