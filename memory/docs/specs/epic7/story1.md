# Story 7.S01: Configurer les secrets GitHub Actions pour CI/CD

**Status:** Draft

## Goal & Context

**User Story:** En tant qu'Admin/DevOps, je veux configurer les secrets GitHub Actions nécessaires (pour GHCR, accès SSH au VPS) de manière sécurisée, afin de permettre aux workflows GitHub Actions de s'authentifier et d'interagir avec les services externes (registre Docker, serveur VPS) sans exposer d'informations sensibles.

**Context:** Cette story est une étape préliminaire indispensable pour l'automatisation des déploiements et la publication d'images Docker. La sécurité des identifiants est primordiale.

## Detailed Requirements

Identifier et configurer tous les secrets requis par les futurs workflows GitHub Actions dans les paramètres du dépôt GitHub. Cela inclut les identifiants pour se connecter à GitHub Container Registry (GHCR) et les informations nécessaires pour établir une connexion SSH sécurisée avec le serveur VPS de production.

## Acceptance Criteria (ACs)

- AC1: Les secrets GitHub Actions suivants sont créés et configurés dans la section "Encrypted Secrets" du dépôt GitHub :
    - `GHCR_USERNAME`: Nom d'utilisateur pour GitHub Container Registry (généralement l'owner du dépôt ou un utilisateur technique).
    - `GHCR_TOKEN`: Un Personal Access Token (PAT) avec les permissions `read:packages` et `write:packages` (et `delete:packages` si nécessaire) pour GHCR.
    - `VPS_SSH_HOST`: L'adresse IP ou le nom d'hôte du serveur VPS.
    - `VPS_SSH_USER`: Le nom d'utilisateur pour la connexion SSH au VPS (l'utilisateur de déploiement).
    - `VPS_SSH_PRIVATE_KEY`: La clé privée SSH (sans passphrase, ou la passphrase doit être gérée séparément si absolument nécessaire et supporté par l'action SSH) correspondant à une clé publique autorisée sur le VPS pour l'utilisateur `VPS_SSH_USER`.
    - `VPS_SSH_PORT`: Le port SSH du VPS (généralement 22, mais configurable si différent).
- AC2: La clé publique SSH correspondante à `VPS_SSH_PRIVATE_KEY` est ajoutée au fichier `~/.ssh/authorized_keys` de l'utilisateur `VPS_SSH_USER` sur le VPS.
- AC3: Les permissions du répertoire `.ssh` et du fichier `authorized_keys` sur le VPS sont restrictives (ex: `700` pour `.ssh`, `600` pour `authorized_keys`).
- AC4: La documentation `docs/ci-cd/pipeline.md` (Section 3.1 "Secrets Configuration") est mise à jour pour lister ces secrets et expliquer brièvement leur rôle et comment les générer/configurer.

## Technical Implementation Context

**Guidance:** Utiliser les détails suivants pour l'implémentation. Consulter les fichiers `docs/` liés pour un contexte plus large si nécessaire.

- **Relevant Files:**
  - Configuration des secrets directement dans l'interface GitHub du dépôt (`Settings > Secrets and variables > Actions`).
  - Sur le VPS : `~/.ssh/authorized_keys` pour l'utilisateur de déploiement.
  - Document de référence : `docs/ci-cd/pipeline.md`.
  - _(Hint: Voir `docs/project-structure.md` pour l'emplacement des documents)_

- **Key Technologies:**
  - GitHub Actions (Secrets).
  - SSH (gestion des clés).
  - GitHub Container Registry (GHCR).
  - _(Hint: Voir `docs/architecture/tech-stack.md`)_

- **API Interactions / SDK Usage:** Non applicable directement, mais les workflows utiliseront ces secrets pour s'authentifier auprès des APIs de GHCR et du service SSH.

- **UI/UX Notes:** Non applicable.

- **Data Structures:** Les secrets sont des paires clé-valeur stockées par GitHub.

- **Environment Variables:** Les secrets configurés seront accessibles comme variables d'environnement dans les workflows GitHub Actions (ex: `${{ secrets.GHCR_TOKEN }}`).

- **Coding Standards Notes:**
  - Nommage clair et cohérent des secrets.
  - Assurer la sécurité de la clé privée SSH (ne jamais la commiter dans le dépôt).
  - _(Hint: Voir `docs/contribution/normes-codage.md`)_

## Tasks / Subtasks

- [ ] Générer une nouvelle paire de clés SSH dédiée au déploiement par GitHub Actions (si pas déjà existante).
- [ ] Ajouter la clé publique générée au fichier `~/.ssh/authorized_keys` de l'utilisateur de déploiement sur le VPS.
- [ ] Vérifier les permissions des fichiers et dossiers SSH sur le VPS.
- [ ] Générer un Personal Access Token (PAT) sur GitHub avec les scopes requis pour GHCR.
- [ ] Dans les paramètres du dépôt GitHub (`Settings > Secrets and variables > Actions`), ajouter chacun des secrets listés dans les ACs avec leurs valeurs correspondantes.
- [ ] Documenter la procédure et la liste des secrets dans `docs/ci-cd/pipeline.md`.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.

- **Manual Verification (GitHub Secrets):**
  - Confirmer que tous les secrets listés sont présents dans l'interface GitHub Actions Secrets.
- **Connection Test (SSH):**
  - Créer un petit workflow GitHub Action de test temporaire qui tente d'établir une connexion SSH au VPS en utilisant les secrets `VPS_SSH_HOST`, `VPS_SSH_USER`, `VPS_SSH_PRIVATE_KEY`, `VPS_SSH_PORT` et une action comme `appleboy/ssh-action` pour exécuter une commande simple (ex: `ls -la`).
- **Connection Test (GHCR):**
  - Dans un workflow de test, tenter de se logger à GHCR en utilisant les secrets `GHCR_USERNAME` et `GHCR_TOKEN` (ex: avec `docker login ghcr.io -u ${{ secrets.GHCR_USERNAME }} -p ${{ secrets.GHCR_TOKEN }}`).
- _(Hint: Voir `docs/tests/strategie-tests.md`. Ces tests sont spécifiques à la configuration CI/CD)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:**
- **Change Log:**
  - Initial Draft