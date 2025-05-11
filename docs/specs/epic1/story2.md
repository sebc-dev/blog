# Story 1.2: Installation de Docker et Docker Compose sur VPS

**Status:** Draft

## Goal & Context

**User Story:** En tant qu'Administrateur Système (Admin), je veux installer et configurer Docker Engine et Docker Compose sur le VPS afin de pouvoir exécuter les applications conteneurisées de manière isolée et reproductible.

**Context:** Cette story fait suite à la sécurisation du VPS (Story 1.1). Elle prépare le terrain pour le déploiement de tous les services applicatifs (Traefik, PostgreSQL, Frontend, Backend) qui seront conteneurisés.

## Detailed Requirements

Installer les versions spécifiées de Docker Engine et du plugin Docker Compose v2 sur le serveur VPS Debian. S'assurer que l'utilisateur de déploiement peut exécuter les commandes Docker.

## Acceptance Criteria (ACs)

- AC1: Docker Engine est installé et le service Docker est actif et fonctionnel sur le VPS.
- AC2: Docker Compose (plugin v2, commande `docker compose`) est installé et fonctionnel.
- AC3: L'utilisateur non-root qui sera utilisé pour les déploiements (par exemple, celui utilisé par la CI/CD via SSH) peut exécuter les commandes `docker` sans `sudo` (ex: en l'ajoutant au groupe `docker`).
- AC4: La commande `docker version` et `docker compose version` affichent les versions attendues (ou compatibles avec celles spécifiées dans `docs/teck-stack.md`).

## Technical Implementation Context

**Guidance:** Utiliser les détails suivants pour l'implémentation. Suivre les instructions officielles de Docker pour l'installation sur Debian.

- **Relevant Files:**
  - Files to Create: Potentiellement des scripts d'installation ou des notes pour ces étapes.
  - Files to Modify: Non applicable directement pour les fichiers du projet, modifications système sur le VPS.
  - _(Hint: Les actions se déroulent directement sur le VPS. Consulter `docs/operations/runbook.md`.)_

- **Key Technologies:**
  - Debian GNU/Linux (version 12.10 "Bookworm")
  - Docker Engine (version 28.1.1 ou compatible, voir `docs/teck-stack.md`)
  - Docker Compose (plugin v2, version 2.36.0 ou compatible, voir `docs/teck-stack.md`)
  - _(Hint: Voir `docs/teck-stack.md` pour la liste complète)_

- **API Interactions / SDK Usage:**
  - Non applicable pour cette story.

- **UI/UX Notes:**
  - Non applicable pour cette story.

- **Data Structures:**
  - Non applicable pour cette story.

- **Environment Variables:**
  - Non applicable pour cette story.

- **Coding Standards Notes:**
  - Suivre les instructions officielles de Docker pour une installation propre et sécurisée.
  - _(Hint: Voir `docs/normes-codage.md` pour les standards généraux)_

## Tasks / Subtasks

- [ ] Préparer le système pour l'installation de Docker :
    - [ ] Désinstaller les anciennes versions de Docker si présentes (`sudo apt-get remove docker docker-engine docker.io containerd runc`).
    - [ ] Mettre à jour l'index des paquets `apt` (`sudo apt-get update`).
    - [ ] Installer les paquets prérequis (`sudo apt-get install ca-certificates curl gnupg lsb-release`).
- [ ] Ajouter le dépôt GPG officiel de Docker :
    - [ ] Créer le répertoire pour les clés GPG : `sudo mkdir -p /etc/apt/keyrings`.
    - [ ] Télécharger la clé GPG de Docker : `curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg`.
- [ ] Configurer le dépôt Docker :
    - [ ] Ajouter le dépôt à sources.list : `echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null`.
- [ ] Installer Docker Engine :
    - [ ] Mettre à jour l'index des paquets `apt` (`sudo apt-get update`).
    - [ ] Installer Docker Engine, containerd, et Docker Compose : `sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y`.
- [ ] Vérifier l'installation de Docker Engine :
    - [ ] Démarrer le service Docker et l'activer au démarrage : `sudo systemctl start docker`, `sudo systemctl enable docker`.
    - [ ] Vérifier que Docker Engine est correctement installé en exécutant l'image hello-world : `sudo docker run hello-world`.
    - [ ] Vérifier la version : `docker version`.
- [ ] Gérer Docker en tant qu'utilisateur non-root (Post-installation) :
    - [ ] Créer le groupe `docker` s'il n'existe pas déjà (`sudo groupadd docker` - devrait exister).
    - [ ] Ajouter l'utilisateur de déploiement au groupe `docker` (`sudo usermod -aG docker $USER` ou le nom d'utilisateur spécifique).
    - [ ] Appliquer les changements de groupe (déconnexion/reconnexion ou `newgrp docker`).
    - [ ] Vérifier que la commande `docker` peut être exécutée sans `sudo` (ex: `docker run hello-world`).
- [ ] Vérifier l'installation de Docker Compose :
    - [ ] Vérifier la version : `docker compose version`.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.
- **Manual/CLI Verification:**
  - Exécuter `docker version` et `docker compose version` et comparer avec les versions attendues.
  - Exécuter `sudo systemctl status docker` pour s'assurer que le service est actif.
  - L'utilisateur de déploiement (après ajout au groupe `docker` et nouvelle session) doit pouvoir exécuter `docker ps` sans `sudo`.
  - L'exécution de `docker run hello-world` (sans sudo par l'utilisateur de déploiement) doit réussir.
- _(Hint: Voir `docs/strategie-tests.md` pour l'approche globale)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
- **Change Log:**
  - Initial Draft