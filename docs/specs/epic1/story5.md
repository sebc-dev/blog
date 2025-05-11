# Story 1.5: Initialisation du Monorepo Git et Structure de Base

**Status:** Draft

## Goal & Context

**User Story:** En tant que Développeur (Dev), je veux initialiser le projet monorepo Git avec la structure de base pour les répertoires `frontend/`, `backend/`, et `docs/` afin d'avoir une structure de projet claire et organisée dès le début.

**Context:** Cette story fait partie de la configuration initiale du projet (Epic 1) et établit le cadre dans lequel tout le code et la documentation du projet seront organisés. Elle suit la sécurisation du VPS et l'installation des outils de conteneurisation.

## Detailed Requirements

Créer un dépôt Git. Mettre en place la structure de dossiers de haut niveau comme défini dans `docs/project-structure.md`. Inclure les fichiers de configuration Git de base comme `.gitignore` et `.editorconfig`.

## Acceptance Criteria (ACs)

- AC1: Un dépôt Git est initialisé à la racine du projet (ex: `blog-technique-bilingue/`).
- AC2: La structure de dossiers principale (`frontend/`, `backend/`, `docs/`, `.github/workflows/`) est créée conformément à `docs/project-structure.md`.
- AC3: Un fichier `.gitignore` global est présent à la racine, incluant les exclusions communes (ex: `node_modules/`, `target/`, `.env`, `*.local`, `dist/`, `pgdata/`, `traefik_data/acme.json` si local).
- AC4: Un fichier `.editorconfig` de base est présent à la racine pour assurer la cohérence du style de code entre les éditeurs.
- AC5: Le premier commit ("Initial project structure" ou similaire) est fait sur la branche principale (ex: `main` ou `develop`).

## Technical Implementation Context

**Guidance:** Utiliser les détails suivants pour l'implémentation. Se référer à `docs/project-structure.md` pour la structure cible.

- **Relevant Files:**
  - Files to Create:
    - `.git/` (créé par `git init`)
    - `frontend/` (dossier)
    - `backend/` (dossier)
    - `docs/` (dossier, avec sous-dossiers comme `architecture`, `setup`, etc. comme défini)
    - `.github/workflows/` (dossier)
    - `.gitignore` (fichier)
    - `.editorconfig` (fichier)
    - `README.md` (fichier à la racine)
  - _(Hint: Voir `docs/project-structure.md` pour la structure complète à initialiser)_

- **Key Technologies:**
  - Git
  - _(Hint: Voir `docs/teck-stack.md`)_

- **API Interactions / SDK Usage:**
  - Non applicable pour cette story.

- **UI/UX Notes:**
  - Non applicable pour cette story.

- **Data Structures:**
  - Non applicable pour cette story.

- **Environment Variables:**
  - Non applicable pour cette story.

- **Coding Standards Notes:**
  - Le `.editorconfig` doit définir les standards de base (indentation, fin de ligne, etc.).
  - Le `.gitignore` doit être exhaustif pour éviter de versionner des fichiers inutiles ou sensibles.
  - Les conventions de nommage de Git (branches, commits) sont définies dans `docs/normes-codage.md`.
  - _(Hint: Voir `docs/normes-codage.md`)_

## Tasks / Subtasks

- [ ] Créer le répertoire racine du projet (ex: `mkdir blog-technique-bilingue && cd blog-technique-bilingue`).
- [ ] Initialiser le dépôt Git (`git init`).
- [ ] Créer la structure de dossiers de haut niveau :
    - [ ] `mkdir frontend backend docs .github .github/workflows scripts`
    - [ ] Créer les sous-dossiers dans `docs/` comme spécifié dans `docs/project-structure.md` (ex: `docs/architecture`, `docs/setup`, `docs/ci-cd`, etc.).
- [ ] Créer le fichier `.gitignore` à la racine avec les contenus suivants (liste indicative à compléter) :
    ```
    # Build artifacts
    dist/
    target/
    build/

    # Dependencies
    node_modules/
    frontend/node_modules/

    # IDEs and editors
    .vscode/
    .idea/
    *.swp
    *.swo

    # OS generated files
    .DS_Store
    Thumbs.db

    # Environment files
    .env
    .env.*.local
    *.local

    # Log files
    *.log
    logs/

    # Docker data (if local and not using named volumes exclusively for gitignore)
    # traefik_data/acme.json # Example if stored locally and not a named volume for gitignore
    # pgdata/ # Example

    # PNPM specific
    frontend/pnpm-debug.log

    # Maven specific
    # Add specific Maven exclusions if necessary beyond target/
    ```
- [ ] Créer le fichier `.editorconfig` à la racine avec un contenu de base, par exemple :
    ```editorconfig
    root = true

    [*]
    charset = utf-8
    end_of_line = lf
    indent_size = 2
    indent_style = space
    insert_final_newline = true
    trim_trailing_whitespace = true

    [*.md]
    indent_size = 4
    trim_trailing_whitespace = false
    ```
- [ ] Créer un fichier `README.md` initial à la racine avec le titre du projet.
- [ ] Ajouter tous les fichiers créés à l'index Git (`git add .`).
- [ ] Faire le premier commit (ex: `git commit -m ":tada: Initial project structure and base configuration"` en respectant les conventions Gitmoji de `docs/normes-codage.md`).
- [ ] (Optionnel mais recommandé) Créer la branche `develop` et la définir comme branche de travail principale pour le développement initial (`git checkout -b develop`).

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.
- **Manual/CLI Verification:**
  - Vérifier que la commande `git status` ne montre aucun fichier non suivi important (après le commit initial).
  - Lister le contenu des répertoires pour confirmer la structure.
  - Inspecter le contenu des fichiers `.gitignore` et `.editorconfig`.
  - Vérifier l'historique Git (`git log`) pour voir le commit initial.
- _(Hint: Voir `docs/strategie-tests.md` pour l'approche globale)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
- **Change Log:**
  - Initial Draft