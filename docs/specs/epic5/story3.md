# Story 5.S03: Générer un sitemap XML avec annotations linguistiques

**Status:** Draft

## Goal & Context

**User Story:** En tant qu'Admin/DevFE, je veux que le site génère un sitemap XML (ou un index de sitemaps) incluant toutes les pages publiées dans toutes les langues, avec les annotations `xhtml:link`, afin d'aider les moteurs de recherche à découvrir et indexer efficacement toutes les versions linguistiques du contenu.

**Context:** Un sitemap XML est un outil crucial pour le SEO, surtout pour les sites multilingues. Il fournit une feuille de route structurée du contenu du site aux moteurs de recherche.

## Detailed Requirements

Configurer l'intégration `@astrojs/sitemap` pour générer automatiquement un sitemap XML. Le sitemap doit lister toutes les pages publiées du site et, pour chaque page ayant des traductions, inclure les éléments `xhtml:link` pointant vers ses versions alternatives dans d'autres langues.

## Acceptance Criteria (ACs)

- AC1: L'intégration `@astrojs/sitemap` est installée et configurée dans `astro.config.mjs`.
- AC2: La variable `site` est correctement définie dans `astro.config.mjs` et utilisée par l'intégration sitemap.
- AC3: La configuration i18n d'Astro (définie dans `astro.config.mjs`, incluant `defaultLocale` et `locales`) est correctement utilisée par `@astrojs/sitemap` pour générer les annotations linguistiques.
- AC4: Un fichier `sitemap-index.xml` (ou `sitemap-0.xml` si pas d'index) est généré à la racine du site lors du build (`dist/`).
- AC5: Le sitemap généré est valide selon les standards XML.
- AC6: Toutes les pages publiées et prévues pour l'indexation (excluant potentiellement des pages non-contenu ou des brouillons) sont présentes dans le sitemap.
- AC7: Pour chaque URL dans le sitemap qui a des versions linguistiques alternatives, des sous-éléments `<xhtml:link rel="alternate" hreflang="[code-langue]" href="[url-version-linguistique]" />` sont présents.
- AC8: La configuration du sitemap peut exclure des pages spécifiques si nécessaire (ex: pages de brouillon, page 404).

## Technical Implementation Context

**Guidance:** Utiliser les détails suivants pour l'implémentation. Consulter les fichiers `docs/` liés pour un contexte plus large si nécessaire.

- **Relevant Files:**
  - Files to Modify:
    - `astro.config.mjs` (pour ajouter et configurer l'intégration `@astrojs/sitemap` et vérifier la configuration i18n).
    - `package.json` (pour ajouter `@astrojs/sitemap` aux dépendances).
  - _(Hint: Voir `docs/project-structure.md` pour la structure globale)_
  - _(Hint: Voir `docs/bilinguisme/gestion-contenu.md` Section 7.4 et `docs/seo/strategie-seo.md` Section 2)_

- **Key Technologies:**
  - Astro, Intégration `@astrojs/sitemap`, XML.
  - _(Hint: Voir `docs/architecture/tech-stack.md` pour la liste complète)_

- **API Interactions / SDK Usage:** Non applicable.

- **UI/UX Notes:** Non applicable directement (impacte le SEO).

- **Data Structures:** Le sitemap est un fichier XML structuré.

- **Environment Variables:**
  - `PUBLIC_SITE_URL` (utilisé pour configurer `Astro.site` dans `astro.config.mjs`, qui est crucial pour les URLs dans le sitemap).
  - _(Hint: Voir `docs/setup/environnement-vars.md` pour toutes les variables)_

- **Coding Standards Notes:**
  - S'assurer que la configuration dans `astro.config.mjs` est propre et bien commentée.
  - _(Hint: Voir `docs/contribution/normes-codage.md` pour les standards complets)_

## Tasks / Subtasks

- [ ] Installer le package `@astrojs/sitemap` : `pnpm install @astrojs/sitemap`.
- [ ] Ajouter l'intégration sitemap à la configuration `integrations` dans `astro.config.mjs`.
- [ ] Configurer l'intégration `@astrojs/sitemap`, en s'assurant qu'elle utilise la configuration i18n existante d'Astro pour générer les `xhtml:link`.
- [ ] Vérifier que l'option `site` dans `astro.config.mjs` est correctement définie avec l'URL de production.
- [ ] (Optionnel) Configurer un filtre pour exclure des pages spécifiques du sitemap si nécessaire (ex: `filter` function in sitemap config).
- [ ] Exécuter `npm run build` pour générer le site et le sitemap.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.

- **Build-time Validation:**
  - Après `npm run build`, vérifier l'existence et le contenu du fichier `dist/sitemap-index.xml` (ou `sitemap-0.xml`).
  - Ouvrir le fichier XML et inspecter sa structure :
    - Valider que le XML est bien formé.
    - Vérifier que les URLs des pages sont correctes et absolues.
    - Pour les pages multilingues, vérifier la présence et l'exactitude des éléments `<xhtml:link>`.
- **Manual/CLI Verification:**
  - Soumettre le sitemap à un validateur XML en ligne.
  - Après déploiement, soumettre le sitemap à Google Search Console (couvert par E5-A02 mais peut être testé en avance).
- _(Hint: Voir `docs/tests/strategie-tests.md` pour l'approche globale)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:**
- **Change Log:**
  - Initial Draft