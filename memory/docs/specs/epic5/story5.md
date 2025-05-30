# Story 5.S05: Assurer des balises <title> uniques et optimisées

**Status:** Draft

## Goal & Context

**User Story:** En tant que Rédacteur/Admin, je veux que chaque page ait une balise `<title>` unique, descriptive et optimisée pour les mots-clés, afin d'améliorer le CTR depuis les SERPs et indiquer clairement le sujet de la page.

**Context:** La balise `<title>` est l'un des éléments SEO on-page les plus importants. Cette story vise à mettre en place le mécanisme technique pour la gérer dynamiquement.

## Detailed Requirements

Modifier les layouts Astro pour permettre la définition dynamique du contenu de la balise `<title>` pour chaque page. Le titre doit être unique par page, descriptif, et respecter les bonnes pratiques SEO (longueur, mots-clés pertinents).

## Acceptance Criteria (ACs)

- AC1: Le layout de base d'Astro (ex: `BaseLayout.astro`) est modifié pour accepter une prop ou utiliser une variable (ex: issue du frontmatter pour les articles, ou passée en prop pour les pages statiques) pour définir le contenu de la balise `<title>`.
- AC2: Pour les pages d'articles (générées à partir de fichiers MDX), le titre de l'article (issu du frontmatter, ex: `title: "Mon Super Article"`) est utilisé comme contenu de la balise `<title>`.
- AC3: Pour les autres pages (accueil, à propos, listing de blog, etc.), un titre spécifique et pertinent est défini.
- AC4: Un mécanisme de fallback ou un titre par défaut est en place si aucun titre spécifique n'est fourni pour une page donnée (ex: Titre du site).
- AC5: Le titre généré respecte les recommandations de longueur (généralement 50-60 caractères) et est unique pour chaque URL.
- AC6: La structure du titre peut suivre un format cohérent, par exemple : "Titre de la Page | Titre du Blog".

## Technical Implementation Context

**Guidance:** Utiliser les détails suivants pour l'implémentation. Consulter les fichiers `docs/` liés pour un contexte plus large si nécessaire.

- **Relevant Files:**
  - Files to Modify:
    - `frontend/src/layouts/BaseLayout.astro` (ou un composant Head partagé).
    - Layouts spécifiques si nécessaire (ex: `frontend/src/layouts/ArticleLayout.astro`).
    - Fichiers de pages Astro (ex: `frontend/src/pages/fr/index.astro`, `frontend/src/pages/fr/a-propos.astro`) pour définir leurs titres.
    - Modèles de frontmatter pour les articles MDX (pour s'assurer qu'un champ `title` est disponible).
  - _(Hint: Voir `docs/project-structure.md` pour la structure globale)_
  - _(Hint: Voir `docs/seo/strategie-seo.md` Section 4.2)_

- **Key Technologies:**
  - Astro (layouts, props, frontmatter).
  - _(Hint: Voir `docs/architecture/tech-stack.md` pour la liste complète)_

- **API Interactions / SDK Usage:** Non applicable.

- **UI/UX Notes:** Bien que technique, le titre apparaît dans l'onglet du navigateur et les SERPs, impactant l'UX.

- **Data Structures:**
  - Utilisation du champ `title` dans le frontmatter des fichiers MDX.
  - Props passées aux layouts pour les pages statiques.

- **Environment Variables:** Non applicable directement.

- **Coding Standards Notes:**
  - Logique claire dans les layouts pour la gestion des titres.
  - _(Hint: Voir `docs/contribution/normes-codage.md` pour les standards complets)_

## Tasks / Subtasks

- [ ] Définir une convention pour le champ `title` dans le frontmatter des articles MDX.
- [ ] Modifier `BaseLayout.astro` (ou le composant Head) pour lire une prop `pageTitle` (ou un nom similaire).
- [ ] Dans `BaseLayout.astro`, utiliser cette prop pour peupler la balise `<title>`. Ajouter le suffixe " | Titre du Blog" si souhaité.
- [ ] Mettre en place un titre par défaut si `pageTitle` n'est pas fournie.
- [ ] Pour les pages d'articles (ex: `[slug].astro`), passer le `title` du frontmatter de l'article au layout.
- [ ] Pour les pages statiques (ex: `index.astro`, `a-propos.astro`), définir et passer un `pageTitle` approprié au layout.
- [ ] Vérifier que les titres sont correctement localisés pour chaque version linguistique des pages.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.

- **Build-time Validation:**
  - Après `npm run build`, inspecter le code HTML généré pour différentes pages (accueil FR/EN, article FR/EN, page à propos FR/EN) :
    - Vérifier que la balise `<title>` est présente dans le `<head>`.
    - Vérifier que le contenu du titre est correct, unique pour la page, et correspond à ce qui a été défini (frontmatter ou prop).
    - Vérifier la structure (ex: avec " | Titre du Blog").
- **Manual/CLI Verification:**
  - Ouvrir les pages générées dans un navigateur et vérifier le titre affiché dans l'onglet/la barre de titre.
- _(Hint: Voir `docs/tests/strategie-tests.md` pour l'approche globale)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:**
- **Change Log:**
  - Initial Draft