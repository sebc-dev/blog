# Story 1.2: Vérification, Authentification et Sécurisation de Docker et Docker Compose sur VPS

**Status:** Draft

## Goal & Context

**User Story:** En tant qu'Administrateur Système (Admin), je veux vérifier et configurer de manière sécurisée l'installation existante de Docker Engine et Docker Compose sur le VPS afin de pouvoir exécuter les applications conteneurisées de manière isolée, reproductible et conforme aux bonnes pratiques de sécurité.

**Context:** Cette story fait suite à la sécurisation du VPS (Story 1.1). Elle prépare le terrain pour le déploiement de tous les services applicatifs (Traefik, PostgreSQL, Frontend, Backend) qui seront conteneurisés en appliquant les principes de sécurité recommandés pour un environnement de production.

## Detailed Requirements

Vérifier les versions existantes de Docker Engine (v28.1.1) et Docker Compose (v2.35.1) sur le serveur VPS Debian. Configurer l'authentification Docker Hub pour contourner les limites de taux. Configurer Docker selon les bonnes pratiques de sécurité. S'assurer qu'un utilisateur de déploiement dédié peut exécuter les commandes Docker de manière sécurisée.

## Acceptance Criteria (ACs)

- AC1: Vérifier que Docker Engine (v28.1.1) et Docker Compose (v2.35.1) sont bien installés, actifs et fonctionnels sur le VPS.
- AC2: Docker est configuré pour s'authentifier auprès de Docker Hub afin d'éviter les erreurs de limite de taux.
- AC3: Un utilisateur non-root dédié aux déploiements est créé et peut exécuter les commandes `docker` sans `sudo` (ex: en l'ajoutant au groupe `docker`).
- AC4: Le démon Docker est configuré avec des paramètres de sécurité renforcés (via daemon.json).
- AC5: Vérifier que l'interaction entre Docker et iptables fonctionne correctement.
- AC6: Les configurations de sécurité sont documentées dans le runbook opérationnel.

## Technical Implementation Context

**Guidance:** Utiliser les détails suivants pour l'implémentation. Suivre les bonnes pratiques de sécurité Docker identifiées pour un environnement de production VPS.

- **Relevant Files:**
  - Files to Create: 
    - `/etc/docker/daemon.json` pour la configuration sécurisée du démon Docker
    - `~/.docker/config.json` pour l'authentification Docker Hub
    - `/etc/sudoers.d/deploy-user` pour les permissions sudo limitées
    - Scripts de configuration et de vérification
    - Documentation des configurations dans `docs/operations/runbook.md`
  - Files to Modify: Non applicable directement pour les fichiers du projet, modifications système sur le VPS.
  - _(Hint: Les actions se déroulent directement sur le VPS. Consulter `docs/operations/runbook.md`.)_

- **Key Technologies:**
  - Debian GNU/Linux (version 12.10 "Bookworm")
  - Docker Engine (version 28.1.1, déjà installée)
  - Docker Compose (plugin v2, version 2.35.1, déjà installée)
  - iptables pour la gestion du pare-feu (déjà configuré)
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
  - Appliquer les bonnes pratiques de sécurité Docker pour un environnement de production.
  - _(Hint: Voir `docs/normes-codage.md` pour les standards généraux)_

## Tasks / Subtasks

- [ ] Vérifier l'installation existante de Docker et Docker Compose :
    - [ ] Vérifier la version de Docker : `docker version` (doit être v28.1.1)
    - [ ] Vérifier la version de Docker Compose : `docker compose version` (doit être v2.35.1)
    - [ ] Vérifier que le service Docker est actif et démarré au boot : `sudo systemctl status docker`

- [ ] Configurer l'authentification Docker Hub :
    - [ ] Créer un compte Docker Hub si ce n'est pas déjà fait (https://hub.docker.com/signup)
    - [ ] Créer un token d'accès sur Docker Hub pour éviter d'utiliser le mot de passe principal :
      ```bash
      # Sur le site Web Docker Hub : Account Settings > Security > New Access Token
      # Puis utiliser ce token comme mot de passe lors du login
      docker login -u USERNAME
      # Entrer le token comme mot de passe
      ```
    - [ ] Vérifier que l'authentification fonctionne en tirant une image avec succès :
      ```bash
      docker pull hello-world
      docker run hello-world
      ```

- [ ] Configurer la sécurité du démon Docker :
    - [ ] Vérifier si le fichier de configuration du démon Docker existe : `ls -la /etc/docker/daemon.json`
    - [ ] Si non, créer le répertoire si nécessaire : `sudo mkdir -p /etc/docker`
    - [ ] Configurer `/etc/docker/daemon.json` avec les paramètres de sécurité recommandés :
      ```json
      {
        "log-driver": "json-file",
        "log-opts": {
          "max-size": "10m",
          "max-file": "3"
        },
        "default-ulimits": {
          "nofile": {
            "Name": "nofile",
            "Hard": 64000,
            "Soft": 64000
          }
        },
        "live-restore": true,
        "userland-proxy": false,
        "no-new-privileges": true,
        "default-runtime": "runc"
      }
      ```
    - [ ] Redémarrer le service Docker pour appliquer la configuration : `sudo systemctl restart docker`
    - [ ] Vérifier que les paramètres sont appliqués : `docker info | grep -i "Default Runtime\|Live Restore\|Logging Driver"`

- [ ] Vérifier l'interaction Docker-iptables :
    - [ ] Examiner les règles iptables actuelles :
      ```bash
      sudo iptables -L -v -n
      sudo iptables -t nat -L -v -n
      ```
    - [ ] Vérifier que les chaînes Docker sont présentes (DOCKER, DOCKER-USER, DOCKER-ISOLATION-STAGE-1, etc.) :
      ```bash
      sudo iptables -t filter -L DOCKER -n
      sudo iptables -t nat -L DOCKER -n
      ```
    - [ ] Vérifier les ports en écoute : `sudo ss -tulpn | grep LISTEN`
    - [ ] Tester l'interaction avec un conteneur :
      ```bash
      # Démarrer un conteneur de test
      docker run -d --name test-nginx -p 8080:80 nginx
      # Vérifier les règles iptables créées
      sudo iptables -t nat -L -n | grep 8080
      # Tester l'accès (selon les règles iptables existantes)
      curl http://localhost:8080
      # Nettoyer
      docker stop test-nginx && docker rm test-nginx
      ```

- [ ] Créer un utilisateur de déploiement dédié :
    - [ ] Créer un nouvel utilisateur dédié pour les déploiements : `sudo adduser deploy-user --disabled-password`
    - [ ] Configurer l'accès SSH par clé pour cet utilisateur :
      ```bash
      sudo mkdir -p /home/deploy-user/.ssh
      # Copier la clé publique autorisée
      sudo sh -c 'echo "SSH_PUBLIC_KEY" > /home/deploy-user/.ssh/authorized_keys'
      sudo chown -R deploy-user:deploy-user /home/deploy-user/.ssh
      sudo chmod 700 /home/deploy-user/.ssh
      sudo chmod 600 /home/deploy-user/.ssh/authorized_keys
      ```
    - [ ] Ajouter l'utilisateur au groupe `docker` : `sudo usermod -aG docker deploy-user`
    - [ ] Créer un fichier de configuration sudo avec les permissions limitées :
      ```bash
      sudo visudo -f /etc/sudoers.d/deploy-user
      ```
      Avec le contenu suivant :
      ```
      # Permissions Docker pour l'utilisateur de déploiement
      deploy-user ALL=(ALL) NOPASSWD: /usr/bin/systemctl status docker, /usr/bin/systemctl restart docker, /usr/bin/docker info, /usr/bin/journalctl -u docker, /usr/bin/grep -r "" /etc/docker/, /usr/bin/cat /etc/docker/*, /usr/bin/apt-get update, /usr/bin/apt-get upgrade -y docker*
      # Permissions pour vérifier la configuration système
      deploy-user ALL=(ALL) NOPASSWD: /usr/bin/ss -tulpn, /usr/bin/iptables -L -n, /usr/bin/iptables -t nat -L -n, /usr/bin/df -h, /usr/bin/du -sh /var/lib/docker*
      ```
    - [ ] Configurer les permissions du fichier sudo : `sudo chmod 440 /etc/sudoers.d/deploy-user`
    - [ ] Configurer l'authentification Docker Hub pour l'utilisateur deploy-user :
      ```bash
      # Option 1: Copier la configuration de l'utilisateur actuel
      sudo mkdir -p /home/deploy-user/.docker
      sudo cp ~/.docker/config.json /home/deploy-user/.docker/
      sudo chown -R deploy-user:deploy-user /home/deploy-user/.docker
      
      # Option 2: Se connecter en tant qu'utilisateur deploy-user et s'authentifier
      sudo -u deploy-user -i
      docker login
      exit
      ```

- [ ] Configurer les bonnes pratiques de sécurité supplémentaires :
    - [ ] Vérifier que le socket Docker n'est pas exposé sur le réseau : 
      ```bash
      ss -tlnp | grep docker
      ```
    - [ ] Configurer un nettoyage périodique des ressources Docker inutilisées :
      ```bash
      # Créer un script de nettoyage
      sudo tee /usr/local/bin/docker-cleanup.sh > /dev/null << 'EOF'
      #!/bin/bash
      # Nettoyer les conteneurs arrêtés
      docker container prune -f
      # Nettoyer les images sans tag et non utilisées
      docker image prune -f
      # Nettoyer les volumes inutilisés
      docker volume prune -f
      # Nettoyer les réseaux inutilisés
      docker network prune -f
      EOF
      
      # Rendre le script exécutable
      sudo chmod +x /usr/local/bin/docker-cleanup.sh
      
      # Ajouter une tâche cron pour l'exécuter hebdomadairement
      echo "0 2 * * 0 root /usr/local/bin/docker-cleanup.sh > /var/log/docker-cleanup.log 2>&1" | sudo tee /etc/cron.d/docker-cleanup
      ```

- [ ] Documenter la configuration sécurisée :
    - [ ] Créer ou mettre à jour le document `docs/operations/runbook.md` avec des sections pour :
      - Docker Engine et Docker Compose: versions et configuration
      - Configuration de la sécurité du démon Docker (daemon.json)
      - Authentification Docker Hub et gestion des tokens
      - Utilisateur deploy-user: permissions et utilisation
      - Interaction Docker-iptables et bonnes pratiques pour les ports
      - Procédures de maintenance et mise à jour
      - Procédure de déploiement Docker sécurisé

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.
- **Manual/CLI Verification:**
  - Vérifier les versions de Docker et Docker Compose : `docker version` et `docker compose version`
  - Vérifier que le service Docker est actif : `sudo systemctl status docker`
  - Vérifier que l'authentification Docker Hub fonctionne : `docker pull hello-world` et `docker run hello-world` ne doivent pas générer d'erreur de limite de taux.
  - Vérifier que le démon Docker utilise la configuration sécurisée : `docker info | grep -i "Default Runtime\|Live Restore\|Logging Driver"`
  - Tester depuis le compte deploy-user :
    ```bash
    sudo su - deploy-user
    docker ps
    docker run hello-world
    sudo systemctl status docker  # Devrait fonctionner sans mot de passe
    sudo reboot  # Devrait être refusé (permission non accordée)
    ```
  - Tester l'interaction Docker-iptables avec un conteneur :
    ```bash
    # En tant qu'utilisateur normal ou deploy-user
    docker run -d --name test-nginx -p 8080:80 nginx
    # Vérifier les règles iptables (accès root nécessaire)
    sudo iptables -t nat -L -n | grep 8080
    # Tester l'accès selon les règles iptables
    curl http://localhost:8080
    # Nettoyer
    docker stop test-nginx && docker rm test-nginx
    ```
  - Vérifier le nettoyage automatique : `sudo ls -la /etc/cron.d/docker-cleanup`
  - Vérifier que la documentation a été mise à jour et est complète.
- _(Hint: Voir `docs/strategie-tests.md` pour l'approche globale)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
- **Change Log:**
  - Initial Draft

## Notes de sécurité additionnelles

- **Authentification Docker Hub**: Utiliser de préférence des tokens d'accès plutôt que le mot de passe principal. Envisager une rotation régulière des tokens (tous les 90 jours par exemple).

- **Socket Docker**: Ne jamais exposer le socket Docker (/var/run/docker.sock) sur le réseau ou le monter dans des conteneurs sans contrôle d'accès strict. Si des outils comme Traefik ont besoin d'accéder au socket Docker, utiliser des permissions restreintes.

- **Utilisateur de déploiement**: Les permissions sudo limitées accordées à l'utilisateur deploy-user suivent le principe du moindre privilège, lui permettant de gérer Docker et de diagnostiquer les problèmes sans avoir accès à toutes les commandes root.

- **Configuration daemon.json**:
  - **log-driver et log-opts**: Empêche les fichiers de logs Docker de remplir le disque en les limitant à 10Mo par fichier avec 3 fichiers max par conteneur.
  - **default-ulimits**: Configure une limite de 64000 fichiers ouverts, suffisante pour la plupart des applications Docker sans risquer d'épuiser les ressources système.
  - **live-restore**: Permet aux conteneurs de continuer à fonctionner pendant un redémarrage du démon Docker, réduisant les temps d'arrêt lors des mises à jour.
  - **userland-proxy**: Désactivé pour utiliser directement iptables pour le mapping de ports, améliorant les performances réseau.
  - **no-new-privileges**: Empêche les processus dans les conteneurs d'acquérir de nouveaux privilèges, bloquant un vecteur d'attaque courant.

- **Nettoyage programmé**: Le nettoyage hebdomadaire des ressources Docker inutilisées évite l'encombrement du système et réduit la surface d'attaque.

- **Pare-feu iptables**: La configuration actuelle est appropriée pour protéger le système tout en permettant à Docker de fonctionner correctement. La chaîne DOCKER-USER peut être utilisée pour ajouter des règles personnalisées supplémentaires si nécessaire.

- **Mises à jour régulières**: Planifier des mises à jour régulières de Docker Engine et des images est essentiel pour la sécurité continue du système.

- **SSH sécurisé**: Le port SSH non standard (3633) actuellement configuré est une bonne pratique de sécurité qui réduit les attaques automatisées.

Cette implémentation se concentre sur la vérification et la sécurisation d'une installation Docker existante, en suivant les recommandations du rapport "Docker sécurisé sur VPS OVH" pour créer un environnement Docker robuste et sécurisé en production.