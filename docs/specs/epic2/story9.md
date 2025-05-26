# Story 2.9 : Persistance et Détection de la Préférence de Langue

**Status:** Draft (Révisé)

## Goal & Context

**User Story :** En tant qu'Utilisateur, je veux avoir ma préférence de langue (choisie via sélecteur) mémorisée et appliquée lors des visites suivantes (détection et persistance) afin d'avoir une expérience utilisateur plus fluide en arrivant directement sur sa langue préférée.

**Context :** Cette story de l'Epic 2 améliore l'expérience utilisateur bilingue en mémorisant le choix de langue. Elle s'appuie sur le routage i18n (Story 2.3) et le sélecteur de langue global (Story 2.6).

## Detailed Requirements

Mettre en place un middleware Astro (`src/middleware.ts`) pour la détection initiale de la langue au niveau serveur (basée sur un cookie, ou l'`Accept-Language` header) et effectuer une redirection si nécessaire. Côté client, lorsque l'utilisateur choisit une langue via le sélecteur, stocker cette préférence dans `localStorage` (pour une réactivité immédiate côté client) et dans un cookie (pour la détection côté serveur lors des requêtes suivantes). Le cookie sera lu par le middleware lors des requêtes suivantes. La logique de redirection doit être robuste pour éviter les boucles et respecter le choix explicite de l'utilisateur lorsqu'il navigue vers une URL avec un préfixe de langue spécifique.

## Acceptance Criteria (ACs)

- AC1 : Un fichier `frontend/src/middleware.ts` est créé et configuré pour s'exécuter sur les requêtes.
- AC2 : Le middleware tente de détecter la langue préférée de l'utilisateur en inspectant, dans cet ordre :
    1. Un cookie spécifique (ex: `preferred_lang`).
    2. L'en-tête `Accept-Language` du navigateur.
- AC3 : **(Révisé)** Si `i18nConfig.routing.prefixDefaultLocale` (depuis la configuration i18n) est `true` ET qu'aucune locale valide n'est présente dans l'URL actuelle (ex : accès à la racine `/` ou à un chemin comme `/produits`), ET que la page n'est pas déjà une redirection vers la cible souhaitée, le middleware effectue une redirection HTTP 302 (ou 307) vers l'URL correcte préfixée par la langue préférée (détectée selon AC2, ou la langue par défaut selon AC8). Le middleware **NE redirige PAS** si une locale valide et supportée est déjà présente dans l'URL (ex : `/fr/produits`), même si elle diffère de la langue préférée stockée dans le cookie.
- AC4 : Le script du `LanguageSwitcherGlobal.astro` (ou un script global) est modifié pour :
    - Écrire la langue sélectionnée par l'utilisateur dans `localStorage` (ex: `localStorage.setItem('preferred_lang', selectedLang);`).
    - Écrire la langue sélectionnée par l'utilisateur dans un cookie (ex: `preferred_lang`), en s'assurant que l'attribut `Secure` est ajouté si la page est servie en HTTPS.
- AC5 : Lors d'une visite ultérieure (nouvelle session ou rechargement), si un cookie `preferred_lang` valide existe, le middleware utilise cette langue comme `preferredLang` et redirige l'utilisateur vers cette langue dès la première requête si les conditions de AC3 sont remplies (principalement pour les accès à la racine ou aux chemins non préfixés).
- AC6 : La logique de redirection évite les boucles infinies (par exemple, en vérifiant que l'URL de destination est différente de l'URL actuelle).
- AC7 : La documentation (`docs/bilinguisme/gestion-contenu.md` Section 6.2) est mise à jour pour refléter l'implémentation finale, y compris la logique de détection et de redirection.
- AC8 : **(Nouveau)** Si aucun cookie `preferred_lang` n'existe ET que l'en-tête `Accept-Language` ne spécifie aucune langue supportée (ou est absent), le middleware utilise la `defaultLocale` configurée (depuis `i18nConfig`) pour déterminer la `preferredLang` et procède à la redirection si nécessaire selon AC3.

## Technical Implementation Context

**Guidance:** Utiliser l'API Middleware d'Astro. Pour le cookie, utiliser les APIs navigateur ou une petite librairie JS. La configuration i18n (locales, defaultLocale, prefixDefaultLocale) sera gérée via un fichier de configuration partagé importé par le middleware.

- **Relevant Files :**
    - Files to Create:
        - `frontend/src/middleware.ts`
        - `frontend/src/i18n-config.ts` (pour centraliser la configuration i18n utilisée par le middleware)
    - Files to Modify :
        - `frontend/src/components/common/LanguageSwitcherGlobal.astro` (ou le script JS associé)
        - `docs/bilinguisme/gestion-contenu.md`
        - `frontend/src/env.d.ts` (pour déclarer `currentLang` sur `App.Locals`)
    - _(Hint : Consulter la documentation Astro sur les Middlewares. Se référer à `docs/bilinguisme/gestion-contenu.md` Section 6.2. S'assurer que `i18n-config.ts` reflète la configuration de `astro.config.mjs`.)_

- **Key Technologies :**
    - Astro (Middleware, API `Astro.cookies`, `Astro.locals`)
    - JavaScript (pour `localStorage` et la gestion des cookies côté client)
    - _(Hint: Voir `docs/teck-stack.md`)_

- **API Interactions / SDK Usage :**
    - Non applicable pour cette story.

- **UI/UX Notes :**
    - La redirection doit être rapide et transparente pour l'utilisateur.
    - Assure une expérience utilisateur plus personnalisée.
    - **Important :** Le choix explicite de l'utilisateur via une URL préfixée par une langue (ex: `/fr/page`) doit toujours être prioritaire sur la préférence stockée pour l'affichage de la page en cours. La préférence stockée sert principalement à la redirection depuis la racine ou les chemins non préfixés.

- **Data Structures :**
    - Stockage simple clé-valeur (`localStorage`, cookie).
    - Fichier de configuration pour i18n (`i18n-config.ts`).

- **Environment Variables :**
    - Non applicable pour cette story.

- **Coding Standards Notes :**
    - La logique du middleware doit être concise et performante.
    - La gestion des cookies doit être conforme aux bonnes pratiques :
        - Côté client : `SameSite=Lax`, `Path=/`, `Max-Age` approprié, et **`Secure` si la page est servie en HTTPS**.
    - _(Hint: Voir `docs/normes-codage.md`)_

## Tasks / Subtasks

- [ ] Créer `frontend/src/i18n-config.ts`:
```typescript
  // frontend/src/i18n-config.ts
  // Ce fichier doit refléter la configuration i18n de astro.config.mjs
  export const i18nConfig = {
      locales: ['en', 'fr'], // Exemple, à adapter
      defaultLocale: 'en',   // Exemple, à adapter
      routing: {
      prefixDefaultLocale: true // Exemple, à adapter
      }
  } as const;
```
- [ ] Créer `frontend/src/middleware.ts`:
```typescript
    // frontend/src/middleware.ts
    import { defineMiddleware } from 'astro:middleware';
    // MODIFIÉ: Importer la configuration depuis le fichier partagé
    import { i18nConfig } from './i18n-config';

    export const onRequest = defineMiddleware(async (context, next) => {
      const { cookies, request, redirect, locals } = context;
      const url = new URL(request.url);

      // Éviter le traitement pour les assets ou les fichiers API
      if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/api/')) {
        return next();
        }

      const pathSegments = url.pathname.split('/').filter(Boolean);
      // MODIFIÉ: currentUrlLocale est null si le premier segment n'est pas une locale supportée
      const currentUrlLocale = pathSegments.length > 0 && i18nConfig.locales.includes(pathSegments)? pathSegments : null;

      let preferredLang = cookies.get('preferred_lang')?.value;

      if (!preferredLang) {
        const acceptLanguageHeader = request.headers.get('accept-language');
        if (acceptLanguageHeader) {
          // Note: L'analyse de Accept-Language est simplifiée et ne gère pas les q-values.
          // Pour une gestion avancée des q-values, une librairie ou une logique plus complexe serait nécessaire.
          const langs = acceptLanguageHeader.split(',').map(lang => lang.split(';').toLowerCase().split('-'));
          preferredLang = langs.find(lang => i18nConfig.locales.includes(lang));
        }
      }
      
      // Utiliser la langue par défaut si aucune préférence n'est trouvée ou supportée
      preferredLang = preferredLang && i18nConfig.locales.includes(preferredLang)? preferredLang : i18nConfig.defaultLocale;

      // Logique de redirection RÉVISÉE (voir AC3)
      // On redirige seulement si prefixDefaultLocale est activé ET qu'il n'y a pas de locale valide dans l'URL actuelle.
      // On NE redirige PAS si une locale valide est déjà dans l'URL (respect du choix explicite de l'utilisateur).
      if (
        i18nConfig.routing.prefixDefaultLocale &&
       !currentUrlLocale // Aucune locale valide dans l'URL (ex: /, /contact, ou /langue-invalide/contact)
      ) {
        let newPathname;
        // Si le chemin est la racine, ou commence par un segment qui n'est pas une locale valide,
        // on construit le nouveau chemin en préfixant avec la langue préférée.
        const basePath = url.pathname === '/'? '' : url.pathname; // Pour la racine, basePath est vide, sinon c'est le chemin complet.
        newPathname = `/${preferredLang}${basePath}`;
        
        // Normaliser les doubles slashs (ex: /fr//path -> /fr/path) et s'assurer que la racine est juste /lang/
        newPathname = newPathname.replace(/\/\//g, '/');
        if (newPathname!== `/${preferredLang}` && newPathname.endsWith('/')) {
            newPathname = newPathname.slice(0, -1); // Éviter slash final sauf si c'est /<lang>/
        }
        if (basePath === '' && newPathname === `/${preferredLang}/`) { // cas / -> /lang/
             newPathname = `/${preferredLang}`;
        }


        if (newPathname!== url.pathname) { // S'assurer qu'on ne redirige pas vers la même URL
           const destinationUrl = new URL(newPathname, url.origin);
           // Prévention de boucle simple : vérifier que l'URL de destination finale est différente
           if (destinationUrl.href!== url.href) {
               return redirect(newPathname, 302); // 302 Found (temporaire) ou 307
           }
        }
      }
      
      // Stocker la langue pour usage dans les pages/layouts via locals.
      // Si currentUrlLocale est défini, c'est la langue de la page. Sinon, c'est la langue préférée.
      locals.currentLang = currentUrlLocale || preferredLang;
      // N'oubliez pas de déclarer `currentLang` dans `src/env.d.ts` pour App.Locals

      return next();
    });
```
- [ ] Modifier `frontend/src/components/common/LanguageSwitcherGlobal.astro` (ou son script JS associé) :
    - Au clic sur un bouton de langue, en plus de la navigation, enregistrer la langue choisie :
        - Dans `localStorage.setItem('preferred_lang', selectedLang);`
- Dans un cookie :
```javascript
  // Exemple de code client pour définir le cookie
  const selectedLang = 'fr'; // exemple de langue sélectionnée
  localStorage.setItem('preferred_lang', selectedLang);

  let cookieString = `preferred_lang=${selectedLang};path=/;max-age=${365 * 24 * 60 * 60};SameSite=Lax`;
  // MODIFIÉ: Ajouter l'attribut Secure si en HTTPS, conformément aux bonnes pratiques
  if (window.location.protocol === 'https:') {
    cookieString += ';Secure';
  }
  document.cookie = cookieString;
```
- [ ] Mettre à jour `frontend/src/env.d.ts` pour inclure `currentLang` dans `App.Locals`:
```typescript
    // src/env.d.ts
    declare namespace App {
      interface Locals {
        currentLang: string;
        // autres propriétés de locals...
      }
    }
```
- [ ] Tester le scénario complet :
    1. Visiter le site pour la première fois (pas de cookie `preferred_lang`). Le middleware devrait essayer de deviner à partir de `Accept-Language` ou utiliser la `defaultLocale` et rediriger si nécessaire (selon AC3 et AC8).
    2. Utiliser le sélecteur pour changer de langue (ex: passer au français).
    3. Vérifier que `localStorage` et le cookie `preferred_lang` sont mis à jour avec "fr" (et que le cookie a l'attribut `Secure` si en HTTPS).
    4. Fermer l'onglet/navigateur, puis rouvrir le site en accédant à la racine (ex: `http://localhost:4321/`).
    5. Vérifier que le middleware lit le cookie et redirige automatiquement vers `/fr/` (ou la langue du cookie).
- [ ] S'assurer que la redirection n'entre pas en conflit avec d'autres redirections et ne crée pas de boucle.
- [ ] Mettre à jour `docs/bilinguisme/gestion-contenu.md` (Section 6.2).

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.
- **Manual/Browser Testing (avec suppression de cookies/localStorage entre les tests):**
    - **Scénario 1 (Première visite, Accept-Language):** Supprimer cookies et localStorage. Configurer le navigateur pour préférer le français dans `Accept-Language`. Visiter `http://localhost:4321/`. S'attendre à être redirigé vers `/fr/` (si `fr` est supporté et `prefixDefaultLocale` est `true`).
    - **Scénario 2 (Choix utilisateur):** Sur `/fr/`, utiliser le sélecteur pour passer à `/en/`. Vérifier que le cookie `preferred_lang` est `en` et `localStorage` aussi. Vérifier les attributs du cookie (Secure si HTTPS).
    - **Scénario 3 (Visite suivante, Cookie):** Fermer le navigateur. Le rouvrir. Visiter `http://localhost:4321/`. S'attendre à être redirigé vers `/en/` (à cause du cookie, si `prefixDefaultLocale` est `true`).
    - **Scénario 4 (Navigation directe - RÉVISÉ):** Visiter directement `/fr/blog/un-article`. Le middleware **NE DOIT PAS** rediriger vers `/en/blog/un-article` si le cookie `preferred_lang` est `en`, car l'utilisateur a explicitement choisi une URL avec une langue valide. La page doit rester `/fr/blog/un-article`.
    - **Scénario 5 (Nouveau - Cookie invalide):** Supprimer localStorage. Définir manuellement le cookie `preferred_lang` à une valeur non supportée (ex: `preferred_lang=xx`). Visiter `http://localhost:4321/`. S'attendre à ce que le middleware ignore le cookie invalide et se rabatte sur `Accept-Language` ou la `defaultLocale` pour la redirection (selon AC3, AC8).
    - **Scénario 6 (Nouveau - Accept-Language non supporté/absent):** Supprimer cookies et localStorage. Configurer `Accept-Language` pour ne contenir que des langues non supportées (ex: `zz-ZZ`), ou le supprimer complètement. Visiter `http://localhost:4321/`. S'attendre à une redirection vers la `defaultLocale` préfixée (selon AC3, AC8).
- _(Hint: Voir `docs/strategie-tests.md`. Envisager des tests automatisés pour le middleware et des tests E2E pour les flux utilisateur.)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed. La logique de redirection dans le middleware peut être complexe à cause des différents cas (racine, page profonde, déjà la bonne langue, etc.) et nécessite des tests approfondis. L'analyse de `Accept-Language` est simplifiée.}
- **Change Log:**
    - Initial Draft
    - Révision basée sur le rapport de validation :
        - Clarification de la logique de redirection (AC3, middleware) pour respecter les URL explicites.
        - Ajout d'un AC (AC8) pour le repli sur la `defaultLocale`.
        - Modification de l'accès à la configuration i18n dans le middleware (via `i18n-config.ts`).
        - Ajout de l'attribut `Secure` conditionnel pour le cookie client.
        - Mise à jour des tâches (création de `i18n-config.ts`, modification de `env.d.ts`).
        - Affinement des scénarios de test (Scénario 4 révisé, ajout Scénarios 5 et 6).
```
