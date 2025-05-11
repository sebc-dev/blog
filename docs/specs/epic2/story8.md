# Story 2.8: Structure pour Traductions des Chaînes UI

**Status:** Draft

## Goal & Context

**User Story:** En tant que Développeur Frontend (DevFE), je veux mettre en place la structure pour les traductions des chaînes de l'UI (textes de navigation, libellés de boutons, etc.) avec des fichiers séparés par langue afin de centraliser et faciliter la gestion des traductions de l'interface utilisateur.

**Context:** Cette story de l'Epic 2 établit le mécanisme pour internationaliser les textes fixes de l'interface utilisateur, complétant ainsi la gestion du contenu bilingue des articles. Elle est nécessaire pour que des éléments comme les menus, les boutons "Lire la suite", etc., soient dans la langue de la page.

## Detailed Requirements

Mettre en place une structure de fichiers pour stocker les chaînes de l'UI traduites (ex: `frontend/src/lib/i18n/[lang].json` ou `.ts`). Créer des fonctions utilitaires pour récupérer la langue actuelle à partir de l'URL (`getLangFromUrl`) et pour obtenir la traduction d'une clé donnée (`useTranslations` ou une simple fonction `t`). Intégrer cette logique pour traduire quelques exemples de chaînes UI dans les layouts ou composants existants.

## Acceptance Criteria (ACs)

- AC1: Une structure de répertoires comme `frontend/src/lib/i18n/` est créée.
- AC2: Des fichiers de traduction par langue (ex: `en.json`/`ts`, `fr.json`/`ts`) sont créés dans ce répertoire, contenant quelques chaînes d'exemple (ex: "accueil", "lireLaSuite").
- AC3: Une fonction utilitaire `getLangFromUrl(url: URL): string` est créée et retourne correctement la locale à partir d'une URL Astro.
- AC4: Une fonction utilitaire (ex: `t(key: string, lang: string)` ou un hook `useTranslations(lang: string)`) est créée pour récupérer une chaîne traduite à partir des fichiers de langue, en utilisant une clé.
- AC5: Au moins une chaîne UI dans un composant existant (ex: `Header.astro` ou `BaseLayout.astro`) est traduite en utilisant ce système et s'affiche correctement en français et en anglais selon la langue de la page.
- AC6: La documentation dans `docs/bilinguisme/gestion-contenu.md` (Section 5) est mise à jour pour refléter cette implémentation.

## Technical Implementation Context

**Guidance:** S'inspirer des patterns courants d'i18n dans les projets JavaScript/TypeScript. Astro ne fournit pas de solution i18n "UI strings" out-of-the-box aussi complète que pour le contenu, donc une solution custom légère est à prévoir.

- **Relevant Files:**
  - Files to Create:
    - `frontend/src/lib/i18n/index.ts` (pour exporter les fonctions utilitaires)
    - `frontend/src/lib/i18n/utils.ts` (contenant `getLangFromUrl`, `t`)
    - `frontend/src/lib/i18n/locales/en.ts` (ou `.json`)
    - `frontend/src/lib/i18n/locales/fr.ts` (ou `.json`)
  - Files to Modify:
    - Au moins un composant existant pour tester l'utilisation (ex: `frontend/src/components/common/Header.astro`).
    - `docs/bilinguisme/gestion-contenu.md`
  - _(Hint: Voir `docs/bilinguisme/gestion-contenu.md` Section 5 pour les orientations.)_

- **Key Technologies:**
  - TypeScript/JavaScript (pour la logique i18n)
  - Astro (pour l'intégration dans les composants)
  - _(Hint: Voir `docs/teck-stack.md`)_

- **API Interactions / SDK Usage:**
  - Non applicable pour cette story.

- **UI/UX Notes:**
  - Assure que l'ensemble de l'interface utilisateur est cohérent linguistiquement.

- **Data Structures:**
  - Objets/JSON pour stocker les paires clé-valeur des traductions.

- **Environment Variables:**
  - Non applicable pour cette story.

- **Coding Standards Notes:**
  - Les clés de traduction doivent être sémantiques et cohérentes.
  - Les fonctions utilitaires doivent être bien testables et documentées.
  - _(Hint: Voir `docs/normes-codage.md`)_

## Tasks / Subtasks

- [ ] Créer les répertoires `frontend/src/lib/i18n/` et `frontend/src/lib/i18n/locales/`.
- [ ] Créer `frontend/src/lib/i18n/locales/en.ts`:
    ```typescript
    // frontend/src/lib/i18n/locales/en.ts
    export default {
      'nav.home': 'Home',
      'nav.blog': 'Blog',
      'nav.about': 'About',
      'article.readMore': 'Read more',
      'footer.copyright': `© ${new Date().getFullYear()} Bilingual Tech Blog. Placeholder.`,
    } as const; // Utiliser 'as const' pour un meilleur typage des clés
    ```
- [ ] Créer `frontend/src/lib/i18n/locales/fr.ts`:
    ```typescript
    // frontend/src/lib/i18n/locales/fr.ts
    export default {
      'nav.home': 'Accueil',
      'nav.blog': 'Blog',
      'nav.about': 'À Propos',
      'article.readMore': 'Lire la suite',
      'footer.copyright': `© ${new Date().getFullYear()} Blog Technique Bilingue. Placeholder.`,
    } as const;
    ```
- [ ] Créer `frontend/src/lib/i18n/utils.ts`:
    ```typescript
    // frontend/src/lib/i18n/utils.ts
    import type { i18n } from 'astro:config'; // Pour type AstroI18nConfig
    import enStrings from './locales/en';
    import frStrings from './locales/fr';

    export type Strings = typeof enStrings; // Toutes les locales doivent avoir les mêmes clés
    export type StringKey = keyof Strings;

    const translations: Record<string, Strings> = {
      en: enStrings,
      fr: frStrings,
    };

    export function getLangFromUrl(url: URL): string {
      const [, lang] = url.pathname.split('/');
      // Valider si 'lang' est une locale supportée, sinon retourner la defaultLocale
      // Supposons que Astro.currentLocale est disponible et fiable grâce à la config i18n
      // Pour un usage générique, on pourrait vérifier contre Astro.config.i18n.locales
      return lang || (import.meta.env.PUBLIC_DEFAULT_LOCALE || 'en');
    }

    // Fonction 't' de base
    export function t(key: StringKey, lang: string): string | undefined {
      const langStrings = translations[lang];
      if (langStrings && typeof langStrings[key] === 'string') {
        return langStrings[key];
      }
      // Fallback à l'anglais si la clé n'est pas trouvée dans la langue actuelle
      // ou si la langue n'est pas supportée (bien que getLangFromUrl devrait gérer cela)
      const fallbackStrings = translations[import.meta.env.PUBLIC_DEFAULT_LOCALE || 'en'];
      if (fallbackStrings && typeof fallbackStrings[key] === 'string') {
          console.warn(`Translation key '${key}' not found for lang '${lang}', using fallback.`);
          return fallbackStrings[key];
      }
      console.error(`Translation key '${key}' not found for lang '${lang}' and no fallback available.`);
      return key; // Retourner la clé elle-même en cas d'échec total
    }

    // Alternative : un hook "useTranslations" qui retourne une fonction 't' pré-configurée pour la langue
    export function useTranslations(lang: string) {
      return function translate(key: StringKey): string {
        return t(key, lang) || key;
      }
    }
    ```
- [ ] Créer `frontend/src/lib/i18n/index.ts` pour exporter les utilitaires :
    ```typescript
    // frontend/src/lib/i18n/index.ts
    export { getLangFromUrl, t, useTranslations, type StringKey } from './utils';
    ```
- [ ] Modifier un composant (ex: `frontend/src/components/common/Footer.astro`) pour utiliser ce système :
    ```astro
    ---
    // src/components/common/Footer.astro
    import { getLangFromUrl, t } from '../../lib/i18n'; // Adapter le chemin

    const lang = getLangFromUrl(Astro.url);
    // Ou si vous préférez le hook (nécessite que 'lang' soit disponible au moment de l'appel)
    // const T = useTranslations(lang);
    ---
    <footer class="bg-base-200 p-4 mt-8 text-center">
      <p>{t('footer.copyright', lang)}</p>
    </footer>
    ```
- [ ] Tester sur les pages `/fr/` et `/en/` pour vérifier que le texte du footer change.
- [ ] Mettre à jour la documentation `docs/bilinguisme/gestion-contenu.md` (Section 5) avec les détails de cette implémentation.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.
- **Manual/Visual Verification:**
  - Naviguer sur les versions française et anglaise des pages qui utilisent les chaînes traduites.
  - Vérifier que les textes s'affichent dans la bonne langue.
  - Tester le fallback : supprimer une clé d'un fichier de langue et vérifier qu'il utilise la langue de fallback (anglais) ou affiche la clé.
- **Unit Tests (Recommandé pour les fonctions utilitaires):**
  - Tester `getLangFromUrl` avec différentes URLs.
  - Tester la fonction `t` (ou le hook `useTranslations`) pour s'assurer qu'elle retourne les bonnes chaînes, gère les clés manquantes et les fallbacks.
- _(Hint: Voir `docs/strategie-tests.md`)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed. Par exemple, la gestion des pluriels ou des interpolations de variables dans les chaînes n'est pas couverte par cette solution de base.}
- **Change Log:**
  - Initial Draft