# Story 7.F01: Workflow Frontend - Lint, Tests Unitaires/Intégration, Build Astro

**Status:** Draft

## Goal & Context

**User Story:** En tant que DevFE/Admin/DevOps, je veux que le workflow frontend (`ci-cd-frontend.yml`) exécute automatiquement le linting, les tests unitaires/intégration (Vitest) et le build Astro sur les PRs et push, afin d'assurer la qualité du code, la non-régression et la capacité à builder le frontend avant tout déploiement.

**Context:** Cette story implémente les premières étapes de validation automatisée pour le code frontend. C'est la base pour garantir que le code intégré est de bonne qualité et que l'application est buildable. Elle s'appuie sur la structure de workflow définie dans E7-S02.

## Detailed Requirements

Configurer le fichier `.github/workflows/ci-cd-frontend.yml` pour inclure des jobs ou des étapes séquentielles qui :
1.  Effectuent le checkout du code.
2.  Initialisent l'environnement Node.js et PNPM, en utilisant le caching pour accélérer les exécutions futures.
3.  Installent les dépendances du projet frontend.
4.  Exécutent les scripts de linting et de formatage (ex: ESLint, Prettier check).
5.  Exécutent les tests unitaires et d'intégration avec Vitest.
6.  Exécutent le build de l'application Astro.
Le workflow doit échouer si l'une de ces étapes échoue.

## Acceptance Criteria (ACs)

- AC1: Le workflow `ci-cd-frontend.yml` contient un job (ex: `build_and_test`) qui s'exécute sur les déclencheurs définis (PRs et push vers `main`/`develop` affectant `frontend/**`).
- AC2: Le job inclut des étapes pour :
    - `actions/checkout@vX`
    - `actions/setup-node@vX` (avec une version de Node.js LTS, ex: 20.x ou 22.x)
    - `pnpm/action-setup@vX` (pour installer PNPM)
    - Configuration du cache pour les dépendances PNPM.
- AC3: Une étape exécute `pnpm install --frozen-lockfile` dans le répertoire `frontend/`.
- AC4: Une étape exécute un script de linting/formatage (ex: `pnpm lint` ou `pnpm format-check`) et le workflow échoue si des erreurs sont trouvées.
- AC5: Une étape exécute les tests unitaires et d'intégration (ex: `pnpm test:unit` ou `pnpm test`) et le workflow échoue si des tests échouent.
- AC6: Une étape exécute le build de l'application Astro (ex: `pnpm build`) et le workflow échoue si le build échoue.
- AC7: Les résultats de chaque étape (succès/échec) sont clairement visibles dans les logs de GitHub Actions.

## Technical Implementation Context

**Guidance:** Utiliser les détails suivants pour l'implémentation. Consulter les fichiers `docs/` liés pour un contexte plus large si nécessaire.

- **Relevant Files:**
  - File to Modify: `.github/workflows/ci-cd-frontend.yml`.
  - Files to Reference: `frontend/package.json` (pour les noms exacts des scripts `lint`, `test`, `build`). `docs/ci-cd/pipeline.md` (Sections 4.3.1, 4.3.2 et une partie de 4.3.3).
  - _(Hint: Voir `docs/project-structure.md`)_

- **Key Technologies:**
  - GitHub Actions (YAML, expressions, actions standards).
  - Node.js, PNPM.
  - Astro CLI (pour `astro build`).
  - Vitest (pour les tests).
  - ESLint/Prettier (pour le linting/formatage).
  - _(Hint: Voir `docs/architecture/tech-stack.md`)_

- **API Interactions / SDK Usage:** Utilisation des actions GitHub (`actions/checkout`, `actions/setup-node`, `pnpm/action-setup`, `actions/cache`).

- **UI/UX Notes:** Non applicable.

- **Data Structures:** Structure YAML du workflow.

- **Environment Variables:** Pas de secrets requis pour ces étapes, mais des variables d'environnement GitHub Actions par défaut peuvent être utilisées (ex: `GITHUB_WORKSPACE`).

- **Coding Standards Notes:**
  - Utiliser des noms d'étapes clairs et descriptifs dans le workflow.
  - _(Hint: Voir `docs/contribution/normes-codage.md`)_

## Tasks / Subtasks

- [ ] Ouvrir et modifier `.github/workflows/ci-cd-frontend.yml`.
- [ ] Définir un job (ex: `build_and_test_frontend`) avec `runs-on: ubuntu-latest`.
- [ ] Ajouter les étapes initiales :
  - `uses: actions/checkout@v4`
  - `uses: actions/setup-node@v4` avec la version Node.js appropriée.
  - `uses: pnpm/action-setup@v3` avec la version de PNPM.
  - Configurer `actions/cache@v4` pour le store PNPM (ex: `~/.pnpm-store`).
- [ ] Ajouter l'étape `working-directory: ./frontend` et `run: pnpm install --frozen-lockfile`.
- [ ] Ajouter l'étape `working-directory: ./frontend` et `run: pnpm run <script-lint-format-check>` (adapter le nom du script).
- [ ] Ajouter l'étape `working-directory: ./frontend` et `run: pnpm run <script-test-unit>` (adapter le nom du script).
- [ ] Ajouter l'étape `working-directory: ./frontend` et `run: pnpm run build`.
- [ ] S'assurer que chaque étape `run` échouera le workflow en cas de code de sortie non nul.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.

- **Déclenchement du Workflow :**
  - Faire un push sur une branche de test avec des modifications dans `frontend/`.
  - Ouvrir une Pull Request ciblant `develop` ou `main` avec des modifications dans `frontend/`.
  - Vérifier que le workflow `ci-cd-frontend.yml` se déclenche et exécute le job `build_and_test_frontend`.
- **Vérification des Étapes :**
  - **Succès :** S'assurer que toutes les étapes passent si le code est propre, que les tests réussissent et que le build est fonctionnel.
  - **Échec Linting/Formatage :** Introduire une erreur de linting/formatage et vérifier que le workflow échoue à l'étape correspondante.
  - **Échec Tests :** Introduire un test qui échoue et vérifier que le workflow échoue à l'étape de test.
  - **Échec Build :** Introduire une erreur qui fait échouer le build Astro (ex: import incorrect) et vérifier que le workflow échoue à l'étape de build.
  - **Cache :** Vérifier dans les logs que le cache PNPM est utilisé lors des exécutions suivantes.
- _(Hint: Voir `docs/tests/strategie-tests.md`)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:**
- **Change Log:**
  - Initial Draft