# Story 3.2: Prévisualisation des articles en cours de rédaction

**Status:** Draft

## Goal & Context

**User Story:** En tant que Rédacteur/Admin, je veux prévisualiser mes articles en cours de rédaction dans un environnement de développement local, afin de vérifier l'apparence et la mise en forme de l'article avant de le marquer comme prêt pour la publication.

**Context:** Cette story améliore le workflow de rédaction en permettant aux auteurs de voir leurs changements en temps réel. Elle s'appuie sur la story E3-S01 pour la structure des articles MDX et le statut `isDraft`.

## Detailed Requirements

- Le serveur de développement Astro (`pnpm dev`) doit pouvoir rendre les articles qui ont `isDraft: true` dans leur frontmatter.
- Ces articles brouillons ne doivent pas être inclus dans le build de production (ex: `pnpm build`) ni apparaître sur le site déployé si leur statut est `isDraft: true`.
- Le rechargement à chaud (Hot Module Replacement - HMR) doit fonctionner pour les modifications apportées aux fichiers MDX (contenu et frontmatter), permettant une prévisualisation instantanée des changements lors du développement local.
- Il faut définir comment accéder aux brouillons en mode développement :
    - Option A : Ils sont accessibles aux mêmes URLs que les articles publiés (ex: `/fr/blog/mon-brouillon`), mais ne sont pas listés sur les pages d'index du blog.
    - Option B : Ils sont accessibles via une URL spécifique pour les brouillons (ex: `/dev/previews/fr/blog/mon-brouillon`).
    - (Préférer Option A pour simplicité si Astro le permet facilement, en s'assurant qu'ils ne sont pas indexés ou listés publiquement).

## Acceptance Criteria (ACs)

- AC1: Un article avec `isDraft: true` dans son frontmatter est accessible et correctement rendu lorsque le site est lancé avec `pnpm dev`.
- AC2: Les articles avec `isDraft: true` ne sont PAS inclus dans le build de production (vérifiable en inspectant les fichiers générés par `pnpm build` ou en vérifiant leur absence sur un déploiement de test).
- AC3: Les articles brouillons n'apparaissent pas sur les pages de listing publiques (ex: page principale du blog, pages de catégories/tags) en mode développement, sauf si un mécanisme de prévisualisation spécifique est mis en place pour les lister.
- AC4: Les modifications apportées au contenu d'un fichier MDX (brouillon ou publié) sont reflétées en temps réel dans le navigateur sans nécessiter un rechargement manuel de la page, lorsque le serveur de développement est actif.
- AC5: Les modifications apportées au frontmatter d'un fichier MDX (ex: changer le `title`) sont également reflétées avec HMR.

## Technical Implementation Context

**Guidance:** Utiliser les fonctionnalités d'Astro pour filtrer les collections de contenu et gérer le HMR.

- **Relevant Files:**
  - Files to Modify: Pages de listing d'articles (ex: `src/pages/[lang]/blog/index.astro`, `src/pages/[lang]/blog/[slug].astro` ou le layout d'article). Potentiellement `astro.config.mjs` pour la configuration MDX ou HMR si nécessaire.
  - _(Hint: See `docs/project-structure.md` for overall layout)_

- **Key Technologies:**
  - Astro (Content Collections API, `getCollection`, HMR)
  - _(Hint: See `docs/tech-stack.md` for full list)_

- **API Interactions / SDK Usage:**
  - N/A
  - _(Hint: See `docs/api-reference.md` for details on external APIs and SDKs)_

- **UI/UX Notes:**
  - L'expérience de prévisualisation doit être identique à celle d'un article publié en termes de rendu.

- **Data Structures:**
  - Le champ `isDraft: boolean` dans le frontmatter est crucial.
  - _(Hint: See `docs/data-models.md` for key project data structures)_

- **Environment Variables:**
  - N/A, mais le mode de build (`import.meta.env.DEV` vs `import.meta.env.PROD`) sera utilisé implicitement par Astro.
  - _(Hint: See `docs/environment-vars.md` for all variables)_

- **Coding Standards Notes:**
  - S'assurer que le filtrage des brouillons est explicite et facile à comprendre dans le code des collections.
  - _(Hint: See `docs/coding-standards.md` for full standards)_

## Tasks / Subtasks

- [ ] Modifier les appels à `getCollection('blog', ...)` dans les pages de listing et potentiellement les pages d'articles pour filtrer les articles avec `isDraft: true` en mode production (`import.meta.env.PROD`).
- [ ] S'assurer qu'en mode développement (`import.meta.env.DEV`), les articles brouillons sont récupérés par `getCollection` et peuvent être rendus par la page de détail de l'article (ex: `src/pages/[lang]/blog/[slug].astro`).
- [ ] Vérifier que les articles brouillons ne sont pas inclus dans les sitemaps ou autres listes générées pour la production.
- [ ] Tester le fonctionnement du HMR pour le contenu MDX : modifier du texte dans un article et voir le changement sans recharger la page.
- [ ] Tester le fonctionnement du HMR pour le frontmatter MDX : modifier le titre d'un article et voir le changement.
- [ ] S'assurer que les articles brouillons ne sont pas listés sur les pages d'index publiques (comme `/blog`) même en mode développement, à moins d'une décision explicite de les afficher dans un contexte de prévisualisation uniquement.

## Testing Requirements

**Guidance:** Vérifier l'implémentation contre les ACs en utilisant les tests suivants.
- **Unit Tests:**
    - Pas de tests unitaires spécifiques pour cette story, car cela repose principalement sur la configuration d'Astro et le filtrage des collections.
- **Integration Tests:**
    - En mode développement, vérifier qu'une requête vers une URL de brouillon connu renvoie bien l'article.
    - En mode production (ou après un build), vérifier que la même URL renvoie une 404 ou est gérée comme non existante.
- **Manual/CLI Verification:**
    - Lancer `pnpm dev` :
        - Créer un article avec `isDraft: true`.
        - Accéder à son URL directe et vérifier qu'il s'affiche.
        - Modifier son contenu et son frontmatter, vérifier les mises à jour HMR.
        - Vérifier qu'il n'apparaît pas sur la page de listing principale du blog.
    - Lancer `pnpm build` et `pnpm preview` (ou inspecter le build output) :
        - Vérifier que l'article brouillon n'est pas présent dans les fichiers générés ou accessible via le serveur de prévisualisation de production.
- _(Hint: See `docs/strategie-tests.md` for the overall approach)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
- **Change Log:**
  - Initial Draft