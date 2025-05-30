# Story 5.S06: Assurer des balises <meta name="description"> uniques et optimisées

**Status:** Draft

## Goal & Context

**User Story:** En tant que Rédacteur/Admin, je veux que chaque page ait une balise `<meta name="description">` unique, engageante et optimisée pour les mots-clés, afin de fournir un résumé pertinent dans les SERPs et inciter au clic.

**Context:** La méta-description est un élément clé pour le SEO on-page et le marketing de recherche, car elle influence directement le taux de clic depuis les résultats de recherche.

## Detailed Requirements

Modifier les layouts Astro pour permettre la définition dynamique du contenu de la balise `<meta name="description">` pour chaque page. La description doit être unique, engageante, et respecter les bonnes pratiques SEO (longueur, mots-clés).

## Acceptance Criteria (ACs)

- AC1: Le layout de base d'Astro (ex: `BaseLayout.astro`) est modifié pour accepter une prop ou utiliser une variable (ex: issue du frontmatter pour les articles, ou passée en prop pour les pages statiques) pour définir le contenu de la balise `<meta name="description">`.
- AC2: Pour les pages d'articles (générées à partir de fichiers MDX), une description (issue du frontmatter, ex: `description: "Un résumé de l'article..."`) est utilisée. Si un champ `excerpt` existe et est pertinent, il peut être utilisé ou adapté.
- AC3: Pour les autres pages (accueil, à propos, listing de blog, etc.), une méta-description spécifique et pertinente est définie.
- AC4: Un mécanisme de fallback ou une description par défaut est en place si aucune description spécifique n'est fournie (peut-être une description générale du blog, bien qu'il soit préférable que chaque page ait la sienne).
- AC5: La description générée respecte les recommandations de longueur (généralement 150-160 caractères).
- AC6: La description est unique pour chaque URL et localisée pour chaque version linguistique.

## Technical Implementation Context

**Guidance:** Utiliser les détails suivants pour l'implémentation. Consulter les fichiers `docs/` liés pour un contexte plus large si nécessaire.

- **Relevant Files:**
  - Files to Modify:
    - `frontend/src/layouts/BaseLayout.astro` (ou un composant Head partagé).
    - Layouts spécifiques si nécessaire.
    - Fichiers de pages Astro pour définir leurs méta-descriptions.
    - Modèles de frontmatter pour les articles MDX (pour s'assurer qu'un champ `description` est disponible et encouragé).
  - _(Hint: Voir `docs/project-structure.md` pour la structure globale)_
  - _(Hint: Voir `docs/seo/strategie-seo.md` Section 4.3)_

- **Key Technologies:**
  - Astro (layouts, props, frontmatter).
  - _(Hint: Voir `docs/architecture/tech-stack.md` pour la liste complète)_

- **API Interactions / SDK Usage:** Non applicable.

- **UI/UX Notes:** Impacte la présentation du site dans les SERPs.

- **Data Structures:**
  - Utilisation d'un champ `description` (ou `excerpt`) dans le frontmatter des fichiers MDX.
  - Props passées aux layouts pour les pages statiques.

- **Environment Variables:** Non applicable directement.

- **Coding Standards Notes:**
  - Logique claire dans les layouts pour la gestion des méta-descriptions.
  - _(Hint: Voir `docs/contribution/normes-codage.md` pour les standards complets)_

## Tasks / Subtasks

- [ ] Définir une convention pour le champ `description` (ou `excerpt`) dans le frontmatter des articles MDX.
- [ ] Modifier `BaseLayout.astro` (ou le composant Head) pour lire une prop `pageDescription` (ou un nom similaire).
- [ ] Dans `BaseLayout.astro`, utiliser cette prop pour peupler l'attribut `content` de la balise `<meta name="description">`.
- [ ] Mettre en place une description par défaut si `pageDescription` n'est pas fournie (à évaluer, une absence peut être préférable à une mauvaise description par défaut).
- [ ] Pour les pages d'articles, passer la `description` (ou l'`excerpt`) du frontmatter de l'article au layout.
- [ ] Pour les pages statiques, définir et passer une `pageDescription` appropriée et localisée au layout.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.

- **Build-time Validation:**
  - Après `npm run build`, inspecter le code HTML généré pour différentes pages :
    - Vérifier la présence de la balise `<meta name="description">`.
    - Vérifier que son contenu est correct, unique, et correspond à ce qui a été défini.
    - Vérifier la longueur approximative.
- **Manual/CLI Verification:**
  - Utiliser les outils de développement du navigateur pour inspecter le `<head>`.
  - Utiliser des outils SEO en ligne pour vérifier la méta-description des pages (après déploiement).
- _(Hint: Voir `docs/tests/strategie-tests.md` pour l'approche globale)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:**
- **Change Log:**
  - Initial Draft