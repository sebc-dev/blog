# Story 6.C04: Organiser les articles initiaux avec tags et piliers

**Status:** Draft

## Goal & Context

**User Story:** En tant que Rédacteur/Admin, je veux organiser les articles initiaux avec des tags pertinents et les associer aux piliers thématiques correspondants, afin de faciliter la découverte de contenu par les utilisateurs et améliorer l'organisation du blog.

**Context:** Cette story assure que le contenu initial n'est pas seulement présent, mais aussi bien structuré et découvrable. Une bonne taxonomie améliore la navigation et l'expérience utilisateur. Elle s'appuie sur les articles créés et traduits dans E6-C01 et E6-C02.

## Detailed Requirements

Attribuer des tags significatifs à chaque article de lancement (originaux et traductions). S'assurer que chaque article est également associé à son pilier thématique principal. Cette information sera stockée dans le frontmatter des fichiers MDX.

## Acceptance Criteria (ACs)

- AC1: Une liste de tags initiaux pertinents pour les thématiques du blog est définie.
- AC2: Chaque article de lancement (les 20 articles, FR et EN) possède un champ `tags` dans son frontmatter, contenant une liste d'un ou plusieurs tags pertinents et localisés (si la nature du tag le requiert).
- AC3: Chaque article de lancement possède un champ `category` (ou un nom de champ équivalent désignant le pilier) dans son frontmatter, indiquant son pilier thématique principal (ex: "Tauri", "IA pour Devs", "UX Desktop", "Ingénierie Logicielle", "Le Coin Francophone").
- AC4: La taxonomie des tags et des piliers est cohérente à travers les deux langues (par exemple, un tag conceptuel devrait avoir des équivalents linguistiques s'ils sont différents).
- AC5: La logique d'affichage des pages de listing par pilier/catégorie (si déjà implémentée dans un Epic précédent, ex: Epic 3) utilise correctement ce champ `category` pour filtrer les articles.
- AC6: La logique d'affichage des tags sur les articles et potentiellement des pages de listing par tag (si implémentée) utilise correctement le champ `tags`.

## Technical Implementation Context

**Guidance:** Utiliser les détails suivants pour l'implémentation. Consulter les fichiers `docs/` liés pour un contexte plus large si nécessaire.

- **Relevant Files:**
  - Files to Modify: Tous les fichiers `.mdx` des articles de lancement dans `frontend/src/content/blog/en/` et `frontend/src/content/blog/fr/` (mise à jour du frontmatter).
  - Files to Reference: `frontend/src/content/config.ts` (pour s'assurer que les champs `tags` et `category` sont bien définis dans le schéma Zod).
  - Potentially files related to listing pages if they need to consume this metadata (ex: `frontend/src/pages/[lang]/blog/category/[category].astro`).
  - _(Hint: Voir `docs/project-structure.md`)_

- **Key Technologies:**
  - MDX frontmatter.
  - Astro (pour la potentielle utilisation de ces champs dans les requêtes de collection ou la logique d'affichage).
  - _(Hint: Voir `docs/architecture/tech-stack.md`)_

- **API Interactions / SDK Usage:** Non applicable.

- **UI/UX Notes:**
  - La présence et la pertinence des tags/catégories affectent directement la navigation et la découvrabilité du contenu, comme spécifié dans `docs/ui-ux/ui-ux-spec.md`.

- **Data Structures:**
  - `tags`: Array de strings dans le frontmatter.
  - `category`: String dans le frontmatter.

- **Environment Variables:** Non applicable.

- **Coding Standards Notes:**
  - Cohérence dans le nommage et l'utilisation des tags et catégories.
  - Utiliser des minuscules et des tirets pour les slugs de tags/catégories si ceux-ci sont utilisés dans les URLs.
  - _(Hint: Voir `docs/contribution/normes-codage.md`)_

## Tasks / Subtasks

- [ ] Établir une liste initiale de tags clés et de noms de catégories/piliers (en s'assurant qu'ils correspondent aux piliers définis dans le PRD).
- [ ] Pour chaque article de lancement (original et traduit) :
  - [ ] Identifier les tags les plus pertinents et les ajouter au champ `tags` du frontmatter.
  - [ ] Assigner le pilier thématique principal au champ `category` du frontmatter.
  - [ ] S'assurer de la localisation des tags si nécessaire (ex: un tag "intelligence-artificielle" en français, "artificial-intelligence" en anglais, même si le concept est le même).
- [ ] Vérifier que les pages de listing par catégorie/pilier (si elles existent) filtrent correctement les articles basés sur ce champ.
- [ ] Vérifier l'affichage des tags sur les pages d'articles.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.

- **Validation de Schéma Frontmatter:**
  - Astro validera que les champs `tags` (s'il est défini comme array de strings) et `category` (s'il est défini comme string/enum) sont corrects via Zod.
- **Prévisualisation Manuelle:**
  - Après avoir mis à jour le frontmatter, prévisualiser plusieurs articles pour s'assurer que les tags et la catégorie s'affichent correctement (si l'UI les affiche).
  - Naviguer vers les pages de listing par catégorie/pilier et vérifier que les articles corrects y apparaissent.
  - Si des pages de tags existent, vérifier leur contenu.
- **Cohérence des Données :**
  - Relire la liste des tags/catégories utilisés à travers tous les articles pour assurer la cohérence et éviter les doublons sémantiques ou les erreurs de frappe.
- _(Hint: Voir `docs/tests/strategie-tests.md`)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:**
- **Change Log:**
  - Initial Draft