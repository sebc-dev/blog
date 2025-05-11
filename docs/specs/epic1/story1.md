# Story 1.1: Configuration Sécurisée du VPS OVH (Debian)

**Status:** Draft

## Goal & Context

**User Story:** En tant qu'Administrateur Système (Admin), je veux configurer le serveur VPS OVH (Debian) avec les bases de sécurité (SSH par clé, `ufw`, `fail2ban`) afin de disposer d'un environnement serveur sécurisé pour héberger l'application.

**Context:** Cette story est la première étape de l'Epic 1 et est fondamentale pour établir un environnement serveur sécurisé avant toute installation d'application. Elle pose les bases de la sécurité de l'infrastructure.

## Detailed Requirements

Mettre en place les configurations de sécurité de base sur le serveur VPS OVH (Debian) existant.

## Acceptance Criteria (ACs)

- AC1: L'accès SSH au VPS se fait uniquement par clé ; l'authentification par mot de passe est désactivée (`PasswordAuthentication no`).
- AC2: Le pare-feu `ufw` est configuré et actif, autorisant uniquement les connexions entrantes sur les ports SSH (par défaut 22/TCP ou port SSH personnalisé), HTTP (80/TCP), et HTTPS (443/TCP).
- AC3: `fail2ban` est installé, configuré (avec les jails par défaut, notamment pour SSH) et actif pour prévenir les attaques par force brute.
- AC4: Le système Debian GNU/Linux sur le VPS est à jour (tous les paquets système).

## Technical Implementation Context

**Guidance:** Utiliser les détails suivants pour l'implémentation. Se référer aux documents liés pour un contexte plus large si nécessaire.

- **Relevant Files:**
  - Files to Create: Potentiellement des scripts de configuration ou des fichiers de notes pour ces étapes manuelles. La configuration de `sshd_config`, `ufw`, et `fail2ban` sera modifiée sur le serveur.
  - Files to Modify: `/etc/ssh/sshd_config`, règles `ufw`, configuration `fail2ban` (ex: `/etc/fail2ban/jail.local`).
  - _(Hint: Les actions se déroulent directement sur le VPS. Consulter `docs/operations/runbook.md` pour les procédures d'opérations, bien que ce document soit à créer/compléter.)_

- **Key Technologies:**
  - Debian GNU/Linux (version 12.10 "Bookworm" comme spécifié dans `docs/teck-stack.md`)
  - OpenSSH Server
  - `ufw` (Uncomplicated Firewall)
  - `fail2ban`
  - _(Hint: Voir `docs/teck-stack.md` pour la liste complète)_

- **API Interactions / SDK Usage:**
  - Non applicable pour cette story.

- **UI/UX Notes:**
  - Non applicable pour cette story.

- **Data Structures:**
  - Non applicable pour cette story.

- **Environment Variables:**
  - Non applicable directement pour cette story, mais le port SSH, s'il est personnalisé, deviendra une variable d'environnement ou une configuration connue pour les étapes suivantes (ex: `VPS_SSH_PORT` pour CI/CD).
  - _(Hint: Voir `docs/environnement-vars.md` pour toutes les variables)_

- **Coding Standards Notes:**
  - S'assurer que les configurations serveur suivent les meilleures pratiques de sécurité.
  - Documenter toute personnalisation importante apportée aux configurations par défaut.
  - _(Hint: Voir `docs/normes-codage.md` pour les standards généraux, bien que moins applicable ici)_

## Tasks / Subtasks

- [ ] Mettre à jour tous les paquets système sur le VPS Debian (`apt update && apt upgrade -y`).
- [ ] Configurer l'accès SSH :
    - [ ] S'assurer qu'une clé SSH publique est ajoutée au fichier `~/.ssh/authorized_keys` de l'utilisateur de déploiement/administration.
    - [ ] Modifier `/etc/ssh/sshd_config` pour désactiver l'authentification par mot de passe (`PasswordAuthentication no`).
    - [ ] (Optionnel mais recommandé) Changer le port SSH par défaut si souhaité et autorisé par les règles de sécurité.
    - [ ] Redémarrer le service SSH (`sudo systemctl restart sshd`).
    - [ ] Tester la connexion SSH par clé et vérifier que la connexion par mot de passe est refusée.
- [ ] Configurer le pare-feu `ufw` :
    - [ ] Installer `ufw` si ce n'est pas déjà fait (`sudo apt install ufw`).
    - [ ] Configurer les règles par défaut (refuser entrant, autoriser sortant) : `sudo ufw default deny incoming`, `sudo ufw default allow outgoing`.
    - [ ] Autoriser les connexions SSH (sur le port par défaut ou personnalisé) : `sudo ufw allow OpenSSH` ou `sudo ufw allow <port_ssh>/tcp`.
    - [ ] Autoriser les connexions HTTP : `sudo ufw allow http` (ou `80/tcp`).
    - [ ] Autoriser les connexions HTTPS : `sudo ufw allow https` (ou `443/tcp`).
    - [ ] Activer `ufw` : `sudo ufw enable`.
    - [ ] Vérifier le statut : `sudo ufw status verbose`.
- [ ] Installer et configurer `fail2ban` :
    - [ ] Installer `fail2ban` (`sudo apt install fail2ban`).
    - [ ] Créer un fichier de configuration local pour les jails (ex: `sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local`).
    - [ ] Vérifier que la section `[sshd]` (ou `[ssh]` selon la version) est activée dans `jail.local`.
    - [ ] Ajuster les paramètres de `fail2ban` (bantime, findtime, maxretry) si nécessaire.
    - [ ] Démarrer et activer le service `fail2ban` (`sudo systemctl start fail2ban`, `sudo systemctl enable fail2ban`).
    - [ ] Vérifier le statut (`sudo systemctl status fail2ban`, `sudo fail2ban-client status sshd`).

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.
- **Manual/CLI Verification:**
  - Tenter de se connecter via SSH avec un mot de passe (doit échouer).
  - Se connecter via SSH avec la clé (doit réussir).
  - Vérifier l'état de `ufw` (`sudo ufw status`) et s'assurer que seules les règles attendues sont actives.
  - Vérifier l'état de `fail2ban` (`sudo fail2ban-client status sshd`) et potentiellement simuler des échecs de connexion pour voir une IP bannie.
  - Vérifier que le système est à jour (`sudo apt list --upgradable`).
- _(Hint: Voir `docs/strategie-tests.md` pour l'approche globale)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
- **Change Log:**
  - Initial Draft