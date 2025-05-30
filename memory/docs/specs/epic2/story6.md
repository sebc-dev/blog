# Story 2.6: Sélecteur de Langue Global (Header)

**Status:** Draft

## Goal & Context

**User Story:** En tant qu'Utilisateur, je veux voir et utiliser un sélecteur de langue global (ex: dans le header) pour passer d'une langue à l'autre sur les pages générales (Accueil, À Propos, listing Blog) afin de naviguer facilement entre les versions linguistiques du site.

**Context:** Cette story de l'Epic 2 implémente un des principaux points d'interaction pour le bilinguisme. Elle s'appuie sur le routage i18n (Story 2.3) et utilise potentiellement des utilitaires pour générer les URLs des pages traduites.

## Detailed Requirements

Créer un composant Astro pour le sélecteur de langue global (ex: `LanguageSwitcherGlobal.astro`) ou l'intégrer directement dans le `Header.astro`. Ce sélecteur doit afficher les langues disponibles (français et anglais) et permettre à l'utilisateur de basculer vers la version correspondante de la page actuelle. Il utilisera l'API `Astro.url` et les fonctions d'Astro pour construire les URLs relatives aux autres locales. Le design doit être conforme à `docs/ui-ux/ui-ux-spec.md` (boutons avec drapeaux).

## Acceptance Criteria (ACs)

- AC1: Un composant `LanguageSwitcherGlobal.astro` est créé (ou la logique est intégrée dans `Header.astro`).
- AC2: Le sélecteur affiche des options pour basculer entre 'fr' et 'en'. L'option de la langue actuelle peut être désactivée ou visuellement distincte.
- AC3: Au clic sur une langue, l'utilisateur est redirigé vers l'URL correspondante de la page actuelle dans la langue sélectionnée (ex: si sur `/fr/about`, cliquer sur 'English' redirige vers `/en/about`).
- AC4: La génération des URLs utilise `getRelativeLocaleUrl(otherLocale)` ou `new URL(Astro.url.pathname, Astro.site).pathname` avec remplacement de la locale pour les pages dont le slug ne change pas entre les langues, ou un système de mappage pour les slugs de pages statiques qui diffèrent (ex: `/fr/a-propos` vs `/en/about`).
- AC5: Le design du sélecteur (ex: boutons avec drapeaux FR/EN) est conforme à `docs/ui-ux/ui-ux-spec.md` (Section 6.1). La langue active est mise en évidence.
- AC6: Le composant est intégré dans le `Header.astro` (créé dans la Story 1.8) et est visible sur toutes les pages utilisant le `BaseLayout.astro`.

## Technical Implementation Context

**Guidance:** Utiliser `Astro.currentLocale`, `Astro.url`, et potentiellement `getRelativeLocaleUrl` d'Astro. Pour les slugs de pages statiques qui diffèrent (ex: "a-propos" vs "about"), un petit objet de mappage peut être nécessaire.

- **Relevant Files:**
  - Files to Create/Modify:
    - `frontend/src/components/common/LanguageSwitcherGlobal.astro` (ou modifier `frontend/src/components/common/Header.astro`)
    - `frontend/src/layouts/BaseLayout.astro` (pour s'assurer que le Header est bien présent)
  - Files to Create (assets):
    - Images de drapeaux (ex: `fr.svg`, `en.svg`) dans `frontend/public/assets/flags/` (ou utiliser des emojis/icônes SVG).
  - _(Hint: Se référer à la documentation Astro sur `i18n` et la génération d'URLs. Consulter `docs/bilinguisme/gestion-contenu.md` Section 4.4 et `docs/ui-ux/ui-ux-spec.md` Section 6.1.)_

- **Key Technologies:**
  - Astro (composants, API i18n)
  - HTML, CSS (TailwindCSS/DaisyUI pour le style)
  - _(Hint: Voir `docs/teck-stack.md`)_

- **API Interactions / SDK Usage:**
  - Non applicable pour cette story.

- **UI/UX Notes:**
  - Le sélecteur doit être clair, accessible et facile à utiliser.
  - L'indication de la langue active est importante.

- **Data Structures:**
  - Potentiel petit objet de mappage pour les slugs de pages statiques si nécessaire.

- **Environment Variables:**
  - Non applicable pour cette story.

- **Coding Standards Notes:**
  - Le composant doit être bien structuré et réutilisable.
  - _(Hint: Voir `docs/normes-codage.md`)_

## Tasks / Subtasks

- [ ] Créer les images de drapeaux (ou choisir des icônes SVG) et les placer dans `frontend/public/assets/flags/`.
- [ ] Créer (ou modifier) le composant `LanguageSwitcherGlobal.astro` (ou `Header.astro`).
- [ ] Dans le composant, récupérer la locale actuelle (`Astro.currentLocale`) et les locales disponibles (`Astro.locales` depuis la config i18n).
- [ ] Pour chaque locale disponible différente de la locale actuelle, générer un lien :
    - Utiliser `getRelativeLocaleUrl(otherLocale, Astro.url.pathname)` pour générer l'URL de la page actuelle dans l'autre langue.
    - *Alternative pour les pages dont le slug ne change pas (ex: `/blog/`)*: `const otherPath = Astro.url.pathname.replace(\`/\${Astro.currentLocale}/\`, \`/\${otherLocale}/\`);`
    - *Pour les pages avec des slugs différents (ex: `/fr/a-propos` vs `/en/about`)* :
        - Définir un objet de mappage simple, ex:
          ```javascript
          const-PAGE_SLUG_MAP = {
            '/fr/a-propos': { en: '/en/about' },
            '/en/about': { fr: '/fr/a-propos' },
            // ... autres pages statiques
          };
          ```
        - Utiliser ce mappage pour trouver l'URL traduite. Si non trouvée, rediriger vers l'accueil de l'autre langue (`getRelativeLocaleUrl(otherLocale, '/')`).
- [ ] Afficher les liens sous forme de boutons avec drapeaux, conformément à `docs/ui-ux/ui-ux-spec.md`. Mettre en évidence la langue active.
    Exemple de structure pour le sélecteur :
    ```astro
    ---
    // LanguageSwitcherGlobal.astro
    import { getRelativeLocaleUrl } from 'astro:i18n'; // Ou astro/i18n/utils

    const currentLocale = Astro.currentLocale;
    const allLocales = Astro.config.i18n.locales; // ['en', 'fr']
    const alternateLocales = allLocales.filter(loc => loc !== currentLocale);

    // Exemple de mappage pour des pages spécifiques (à externaliser si volumineux)
    const specificPageTranslations = {
        '/fr/a-propos/': { en: '/en/about/' },
        '/en/about/': { fr: '/fr/a-propos/' },
        // Ajoutez d'autres pages ici si leurs slugs sont différents
    };

    function getTranslatedPath(localeToSwitchTo, currentPathname) {
        // 1. Vérifier si la page actuelle a une traduction spécifique mappée
        const currentPathWithSlash = currentPathname.endsWith('/') ? currentPathname : `${currentPathname}/`;
        if (specificPageTranslations[currentPathWithSlash] && specificPageTranslations[currentPathWithSlash][localeToSwitchTo]) {
            return specificPageTranslations[currentPathWithSlash][localeToSwitchTo];
        }
        // 2. Pour les pages non mappées (ex: /blog, /), essayer de remplacer le segment de langue
        // Cela suppose que le reste du chemin est le même ou géré par Astro pour les collections
        const pathSegments = currentPathname.split('/').filter(Boolean);
        if (pathSegments[0] === currentLocale) {
            pathSegments[0] = localeToSwitchTo;
            return `/${pathSegments.join('/')}${currentPathname.endsWith('/') ? '/' : ''}`;
        }
        // 3. Fallback : aller à la racine de la langue cible
        return `/${localeToSwitchTo}/`;
    }
    ---
    <div class="flex space-x-2">
      {allLocales.map(locale => {
        const isActive = locale === currentLocale;
        const translatedPath = isActive ? Astro.url.pathname : getTranslatedPath(locale, Astro.url.pathname);
        const flag = locale === 'fr' ? '🇫🇷' : '🇬🇧'; // Ou utiliser des images SVG

        return (
          <a
            href={translatedPath}
            class:list={[
              "btn btn-sm", // Ou autre style DaisyUI
              isActive ? "btn-active btn-disabled" : "btn-ghost",
            ]}
            aria-current={isActive ? "page" : false}
            aria-label={`Switch to ${locale === 'fr' ? 'French' : 'English'}`}
          >
            {flag} <span class="hidden sm:inline ml-1">{locale.toUpperCase()}</span>
          </a>
        );
      })}
    </div>
    ```
- [ ] Intégrer ce composant dans `Header.astro`.
- [ ] Tester la navigation entre les langues sur différentes pages (accueil, "À Propos" si créée, page de listing du blog si créée).

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.
- **Manual/Browser Navigation:**
  - Sur la page d'accueil (`/fr/` et `/en/`), utiliser le sélecteur pour basculer entre les langues. Vérifier que l'URL change correctement et que le contenu (même si c'est le même `index.astro` pour l'instant) est servi sous la bonne URL de langue.
  - Si une page "À Propos" avec des slugs différents est créée (ex: `/fr/a-propos` et `/en/about`), tester le basculement entre ces pages.
  - Vérifier que la langue active est correctement indiquée/désactivée dans le sélecteur.
  - S'assurer que le design correspond aux maquettes UI/UX.
- _(Hint: Voir `docs/strategie-tests.md` et `docs/bilinguisme/gestion-contenu.md`)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed, notamment la stratégie de mappage des URLs pour les pages statiques}
- **Change Log:**
  - Initial Draft