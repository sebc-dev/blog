# Story 7.S02: Mettre en place la structure des fichiers de workflow GitHub Actions

**Status:** Draft

## Goal & Context

**User Story:** En tant qu'Admin/DevOps, je veux mettre en place la structure des fichiers de workflow GitHub Actions (`.github/workflows/ci-cd-frontend.yml`, `.github/workflows/ci-cd-backend.yml`), afin d'organiser les pipelines CI/CD de manière modulaire et maintenable, avec des workflows distincts pour le frontend et le backend.

**Context:** Une structure de workflow bien définie est la base pour implémenter les différentes étapes d'automatisation. Séparer les workflows frontend et backend permet une gestion plus fine des déclencheurs et des étapes spécifiques à chaque application.

## Detailed Requirements

Créer le répertoire `.github/workflows/` à la racine du projet. À l'intérieur, initialiser deux fichiers YAML : `ci-cd-frontend.yml` et `ci-cd-backend.yml`. Chaque fichier doit contenir la structure de base d'un workflow GitHub Actions, incluant un nom, des déclencheurs (`on:`) initiaux, et une section `jobs` vide ou avec un job placeholder. Les déclencheurs devront être configurés pour cibler les modifications dans les répertoires `frontend/` et `backend/` respectivement.

## Acceptance Criteria (ACs)

- AC1: Le répertoire `.github/workflows/` est créé à la racine du projet.
- AC2: Le fichier `.github/workflows/ci-cd-frontend.yml` est créé.
  - Il a un attribut `name` (ex: "CI/CD Frontend").
  - Il est configuré pour se déclencher sur les événements `push` (vers les branches `main` et `develop`) et `pull_request` (ciblant les branches `main` et `develop`), mais **uniquement** si des modifications concernent le répertoire `frontend/**` ou ce fichier de workflow lui-même.
  - Il contient une section `jobs:` avec au moins un job placeholder (ex: `placeholder_frontend_job:`).
- AC3: Le fichier `.github/workflows/ci-cd-backend.yml` est créé.
  - Il a un attribut `name` (ex: "CI/CD Backend").
  - Il est configuré pour se déclencher sur les événements `push` (vers les branches `main` et `develop`) et `pull_request` (ciblant les branches `main` et `develop`), mais **uniquement** si des modifications concernent le répertoire `backend/**` ou ce fichier de workflow lui-même.
  - Il contient une section `jobs:` avec au moins un job placeholder (ex: `placeholder_backend_job:`).
- AC4: Les workflows peuvent être syntaxiquement validés (par exemple, en les poussant vers GitHub ou en utilisant un linter YAML localement).

## Technical Implementation Context

**Guidance:** Utiliser les détails suivants pour l'implémentation. Consulter les fichiers `docs/` liés pour un contexte plus large si nécessaire.

- **Relevant Files:**
  - Files to Create:
    - `.github/workflows/ci-cd-frontend.yml`
    - `.github/workflows/ci-cd-backend.yml`
  - Files to Reference: `docs/ci-cd/pipeline.md` (Sections 2.1, 4.1, 4.2, 5.1, 5.2 pour la structure et les déclencheurs). `docs/project-structure.md` (pour les chemins `frontend/` et `backend/`).
  - _(Hint: Voir `docs/project-structure.md` pour l'emplacement des workflows)_

- **Key Technologies:**
  - GitHub Actions (YAML syntaxe pour les workflows).
  - Git.
  - _(Hint: Voir `docs/architecture/tech-stack.md`)_

- **API Interactions / SDK Usage:** Non applicable.

- **UI/UX Notes:** Non applicable.

- **Data Structures:** Structure YAML des fichiers de workflow.

- **Environment Variables:** Pas de variables d'environnement spécifiques pour la structure, mais les jobs futurs en utiliseront.

- **Coding Standards Notes:**
  - Nommage clair des fichiers de workflow et des jobs.
  - Indentation et formatage YAML corrects.
  - Commentaires dans les fichiers YAML pour expliquer les sections complexes ou les décisions de configuration.
  - _(Hint: Voir `docs/contribution/normes-codage.md`)_

## Tasks / Subtasks

- [ ] Créer le répertoire `.github/workflows/` si ce n'est pas déjà fait.
- [ ] Créer le fichier `ci-cd-frontend.yml`.
  - [ ] Définir le `name:` du workflow.
  - [ ] Configurer la section `on:` avec `push` (branches `main`, `develop`) et `pull_request` (branches `main`, `develop`), et la condition `paths: ['frontend/**', '.github/workflows/ci-cd-frontend.yml']`.
  - [ ] Ajouter une section `jobs:` avec un job placeholder simple (ex: un job qui fait un `echo "Frontend workflow placeholder"`).
- [ ] Créer le fichier `ci-cd-backend.yml`.
  - [ ] Définir le `name:` du workflow.
  - [ ] Configurer la section `on:` avec `push` (branches `main`, `develop`) et `pull_request` (branches `main`, `develop`), et la condition `paths: ['backend/**', '.github/workflows/ci-cd-backend.yml']`.
  - [ ] Ajouter une section `jobs:` avec un job placeholder simple.
- [ ] Commiter ces nouveaux fichiers dans le dépôt.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.

- **Validation GitHub Actions :**
  - Après avoir commité et poussé les fichiers de workflow sur une branche de test :
    - Faire une modification uniquement dans `frontend/` et vérifier que seul le workflow `ci-cd-frontend.yml` se déclenche.
    - Faire une modification uniquement dans `backend/` et vérifier que seul le workflow `ci-cd-backend.yml` se déclenche.
    - Faire une modification dans un autre répertoire (ex: `docs/`) et vérifier qu'aucun des deux workflows ne se déclenche (sauf si les `paths` incluent aussi ces fichiers, ce qui n'est pas le cas ici).
    - Vérifier que les jobs placeholder s'exécutent correctement.
  - Vérifier l'onglet "Actions" du dépôt GitHub pour voir les exécutions de workflow et leur statut.
- **Syntaxe YAML :**
  - Utiliser un linter YAML local ou se fier à la validation de GitHub lors de l'exécution du workflow.
- _(Hint: Voir `docs/tests/strategie-tests.md`)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:**
- **Change Log:**
  - Initial Draft