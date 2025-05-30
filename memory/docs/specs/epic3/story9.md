# Story 3.9: Données structurées Schema.org pour les articles

**Status:** Draft

## Goal & Context

**User Story:** En tant que Moteur de Recherche, je veux crawler et indexer le contenu des articles avec les bonnes données structurées (Schema.org pour `BlogPosting`/`TechArticle`), afin d'améliorer la visibilité des articles dans les résultats de recherche et permettre l'affichage de résultats enrichis.

**Context:** Les données structurées aident les moteurs de recherche à comprendre le contenu des pages, ce qui peut améliorer le SEO et l'apparence dans les SERPs. Cette story est purement technique et concerne le backend du rendu HTML.

## Detailed Requirements

- Intégrer un mécanisme pour générer des données structurées au format JSON-LD dans le `<head>` des pages d'articles.
- Utiliser le type Schema.org `BlogPosting`. Si le contenu est très technique, envisager d'utiliser `TechArticle` (qui hérite de `Article`, qui hérite de `CreativeWork`). Pour le MVP, `BlogPosting` est suffisant, mais la structure doit permettre une évolution vers `TechArticle`.
- Les données structurées doivent inclure au minimum les propriétés suivantes, extraites du frontmatter et du contenu de l'article :
    - `@context`: "https://schema.org"
    - `@type`: "BlogPosting" (ou "TechArticle")
    - `headline`: Titre de l'article (du frontmatter `title`).
    - `description`: Description courte de l'article (du frontmatter `description`).
    - `datePublished`: Date de publication (du frontmatter `pubDate`, format ISO 8601).
    - `dateModified`: Date de dernière modification (du frontmatter `updatedDate` si disponible, sinon `pubDate`, format ISO 8601).
    - `author`: Information sur l'auteur. Pour le MVP, cela peut être un objet de type `Person` ou `Organization` statique ou configurable globalement.
        - `@type`: "Person" (ou "Organization")
        - `name`: "Nom de l'auteur/Blog"
        - `url`: "URL du site ou de l'auteur" (optionnel)
    - `publisher`: Information sur l'éditeur (souvent identique à l'auteur pour un blog personnel).
        - `@type`: "Organization"
        - `name`: "Nom du Blog"
        - `logo`: Un objet de type `ImageObject` pointant vers le logo du site.
            - `@type`: "ImageObject"
            - `url`: "URL du fichier logo"
    - `image`: URL de l'image principale de l'article (du frontmatter `image`, si disponible, doit être une URL absolue).
    - `mainEntityOfPage`: Un objet avec `@type: WebPage` et `@id` pointant vers l'URL canonique de l'article.
    - `inLanguage`: Langue de l'article (du frontmatter `lang`, ex: "fr", "en").
- Le script JSON-LD doit être valide.

## Acceptance Criteria (ACs)

- AC1: Chaque page d'article générée contient un script `<script type="application/ld+json">` dans la section `<head>`.
- AC2: Le JSON-LD utilise `@type: "BlogPosting"` (ou "TechArticle") et inclut les propriétés `headline`, `description`, `datePublished`, `dateModified`, `author`, `publisher`, `image` (si applicable), `mainEntityOfPage`, et `inLanguage`.
- AC3: Les valeurs de ces propriétés sont correctement extraites du frontmatter de l'article et/ou des configurations globales.
- AC4: Les dates sont au format ISO 8601. Les URLs (image, logo, page) sont absolues.
- AC5: Le JSON-LD généré est valide et peut être testé avec des outils comme le "Rich Results Test" de Google.
- AC6: Les informations `author` et `publisher` (y compris le logo du publisher) sont configurables et correctement incluses.

## Technical Implementation Context

**Guidance:** Créer un composant Astro dédié (ex: `SeoArticleSchema.astro`) qui prend les données du frontmatter en props et génère le JSON-LD. Ce composant sera utilisé dans `ArticleLayout.astro`.

- **Relevant Files:**
  - Files to Create: `src/components/seo/ArticleSchema.astro` (ou un nom similaire).
  - Files to Modify: `src/layouts/ArticleLayout.astro` (pour y inclure le composant et lui passer les props).
  - _(Hint: See `docs/project-structure.md` for overall layout)_

- **Key Technologies:**
  - Astro (composants, props)
  - JSON-LD
  - Schema.org (vocabulaire `BlogPosting`/`TechArticle`)
  - _(Hint: See `docs/tech-stack.md` for full list)_

- **API Interactions / SDK Usage:**
  - N/A
  - _(Hint: See `docs/api-reference.md` for details on external APIs and SDKs)_

- **UI/UX Notes:**
  - N/A (concerne le code source HTML, invisible pour l'utilisateur final directement).

- **Data Structures:**
  - Un objet JavaScript représentant la structure Schema.org à sérialiser en JSON.
  - Frontmatter de l'article (`title`, `description`, `pubDate`, `updatedDate`, `image`, `lang`, `slug`).
  - Configuration globale pour `author`, `publisher`, `logo URL`, `site URL`.
  - _(Hint: See `docs/data-models.md` for key project data structures)_

- **Environment Variables:**
  - `PUBLIC_SITE_URL` sera nécessaire pour construire les URLs absolues.
  - _(Hint: See `docs/environnement-vars.md` for all variables)_

- **Coding Standards Notes:**
  - Le composant `ArticleSchema.astro` doit générer un JSON propre et valide.
  - Gérer proprement les cas où des champs optionnels (comme `image` ou `updatedDate`) sont absents.
  - _(Hint: See `docs/coding-standards.md` for full standards)_

## Tasks / Subtasks

- [ ] Créer le composant `src/components/seo/ArticleSchema.astro`.
- [ ] Définir les props que ce composant attendra (ex: `frontmatter`, `canonicalUrl`).
- [ ] Dans ce composant, construire l'objet JavaScript représentant le schéma `BlogPosting`.
    - Utiliser les props pour remplir les champs dynamiques (`headline`, `description`, `datePublished`, `dateModified`, `image`, `mainEntityOfPage.@id`, `inLanguage`).
    - Utiliser des valeurs globales/configurées pour `author`, `publisher` (nom, logo). Le logo du publisher peut être une URL statique.
- [ ] Sérialiser cet objet en JSON et l'injecter dans un tag `<script type="application/ld+json">`.
- [ ] Gérer les dates pour qu'elles soient au format ISO 8601 (`YYYY-MM-DDTHH:mm:ssZ`).
- [ ] S'assurer que les URLs (image de l'article, logo du publisher, URL canonique de la page) sont absolues (utiliser `PUBLIC_SITE_URL`).
- [ ] Intégrer le composant `ArticleSchema.astro` dans la section `<head>` de `src/layouts/ArticleLayout.astro`, en lui passant les données nécessaires.
- [ ] Définir des valeurs par défaut ou des configurations globales pour les informations `author` et `publisher` (nom, URL du site, URL du logo).

## Testing Requirements

**Guidance:** Vérifier l'implémentation contre les ACs en utilisant les tests suivants.
- **Unit Tests:**
    - Tester le composant `ArticleSchema.astro` en lui passant différentes données de frontmatter et vérifier que le JSON généré est correct et complet.
- **Integration Tests (Snapshot):**
    - Faire un snapshot du `<head>` d'une page d'article rendue pour vérifier la présence et la structure du script JSON-LD.
- **Manual/CLI Verification:**
    - Inspecter le code source HTML d'une page d'article pour vérifier la présence du script JSON-LD dans le `<head>`.
    - Copier le contenu du script JSON-LD et le valider avec un outil en ligne :
        - Google Rich Results Test (https://search.google.com/test/rich-results)
        - Schema Markup Validator (https://validator.schema.org/)
    - Vérifier que toutes les propriétés requises sont présentes et que leurs valeurs sont correctes (dates, URLs, etc.).
    - Vérifier le cas où une image d'article n'est pas fournie (la propriété `image` doit être omise ou gérée gracieusement).
- _(Hint: See `docs/strategie-tests.md` for the overall approach)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
- **Change Log:**
  - Initial Draft