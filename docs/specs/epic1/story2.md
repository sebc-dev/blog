Voici une version révisée de la story, adaptée pour l'utilisation d'iptables au lieu de UFW:

# Story 1.2: Vérification et Sécurisation de Docker et Docker Compose sur VPS

**Status:** Draft

## Goal & Context

**User Story:** En tant qu'Administrateur Système (Admin), je veux vérifier et configurer de manière sécurisée l'installation existante de Docker Engine et Docker Compose sur le VPS afin de pouvoir exécuter les applications conteneurisées de manière isolée, reproductible et conforme aux bonnes pratiques de sécurité.

**Context:** Cette story fait suite à la sécurisation du VPS (Story 1.1). Elle prépare le terrain pour le déploiement de tous les services applicatifs (Traefik, PostgreSQL, Frontend, Backend) qui seront conteneurisés en appliquant les principes de sécurité recommandés pour un environnement de production.

## Detailed Requirements

Vérifier les versions existantes de Docker Engine et Docker Compose sur le serveur VPS Debian. Configurer Docker selon les bonnes pratiques de sécurité. S'assurer qu'un utilisateur de déploiement dédié peut exécuter les commandes Docker de manière sécurisée.

## Acceptance Criteria (ACs)

- AC1: Vérifier que Docker Engine (v28.1.1) et Docker Compose (v2.35.1) sont bien installés, actifs et fonctionnels sur le VPS.
- AC2: Un utilisateur non-root dédié aux déploiements est créé et peut exécuter les commandes `docker` sans `sudo` (ex: en l'ajoutant au groupe `docker`).
- AC3: Le démon Docker est configuré avec des paramètres de sécurité renforcés (via daemon.json).
- AC4: L'interaction entre Docker et iptables est correctement configurée pour éviter les contournements involontaires des règles de pare-feu.
- AC5: Les configurations de sécurité sont documentées dans le runbook opérationnel.

## Technical Implementation Context

**Guidance:** Utiliser les détails suivants pour l'implémentation. Suivre les bonnes pratiques de sécurité Docker identifiées pour un environnement de production VPS.

- **Relevant Files:**
  - Files to Create: 
    - `/etc/docker/daemon.json` pour la configuration sécurisée du démon Docker
    - `/etc/iptables/rules.v4` pour la persistance des règles iptables
    - Scripts de configuration et de vérification
    - Documentation des configurations dans `docs/operations/runbook.md`
  - Files to Modify: Non applicable directement pour les fichiers du projet, modifications système sur le VPS.
  - _(Hint: Les actions se déroulent directement sur le VPS. Consulter `docs/operations/runbook.md`.)_

- **Key Technologies:**
  - Debian GNU/Linux (version 12.10 "Bookworm")
  - Docker Engine (version 28.1.1, déjà installée)
  - Docker Compose (plugin v2, version 2.35.1, déjà installée)
  - iptables pour la gestion du pare-feu
  - iptables-persistent pour la persistance des règles
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
    - [ ] Vérifier le bon fonctionnement avec une image de test : `docker run hello-world`

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

- [ ] Configurer l'interaction Docker-iptables :
    - [ ] Vérifier que iptables est installé : `sudo apt-get install iptables iptables-persistent -y`
    - [ ] Examiner les règles iptables actuelles pour comprendre comment Docker les modifie :
      ```bash
      sudo iptables -L -v -n
      sudo iptables -t nat -L -v -n
      ```
    - [ ] Option 1 (Recommandée) - Laisser Docker gérer ses règles iptables mais contrôler les ports exposés :
      - Configurer les règles iptables de base pour le VPS :
        ```bash
        # Politiques par défaut
        sudo iptables -P INPUT DROP
        sudo iptables -P FORWARD DROP
        sudo iptables -P OUTPUT ACCEPT
        
        # Autoriser les connexions établies et connexions internes
        sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
        sudo iptables -A INPUT -i lo -j ACCEPT
        
        # Autoriser SSH
        sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
        
        # Autoriser uniquement les services Docker spécifiques (exemples)
        # Ces règles seront adaptées en fonction des services qui seront déployés
        # Par exemple, pour Traefik (ports 80/443) :
        sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
        sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
        ```
    - [ ] Option 2 (Alternative) - Désactiver la gestion iptables par Docker :
      - Modifier `/etc/docker/daemon.json` pour ajouter :
        ```json
        {
          "iptables": false
        }
        ```
      - Configurer manuellement les règles iptables pour Docker:
        ```bash
        # Règles pour le MASQUERADE
        sudo iptables -t nat -A POSTROUTING -s 172.17.0.0/16 ! -o docker0 -j MASQUERADE
        # Autoriser le forwarding entre les interfaces
        sudo iptables -A FORWARD -i docker0 -o eth0 -j ACCEPT
        sudo iptables -A FORWARD -i eth0 -o docker0 -j ACCEPT
        ```
    - [ ] Sauvegarder les règles iptables pour les rendre persistantes :
      ```bash
      sudo sh -c "iptables-save > /etc/iptables/rules.v4"
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
    - [ ] Limiter les permissions sudo de cet utilisateur (optionnel, mais recommandé) en créant un fichier dans /etc/sudoers.d/

- [ ] Configurer les bonnes pratiques de sécurité supplémentaires :
    - [ ] Vérifier que le socket Docker n'est pas exposé sur le réseau : 
      ```bash
      ss -tlnp | grep docker
      ```
    - [ ] Vérifier que les mises à jour de sécurité automatiques sont configurées :
      ```bash
      dpkg -l | grep unattended-upgrades
      ```
    - [ ] Si nécessaire, installer et configurer les mises à jour automatiques :
      ```bash
      sudo apt-get install unattended-upgrades apt-listchanges -y
      sudo dpkg-reconfigure -plow unattended-upgrades
      ```

- [ ] Documenter la configuration sécurisée :
    - [ ] Mettre à jour le runbook opérationnel avec les détails de la configuration sécurisée
    - [ ] Documenter les procédures de mise à jour et de maintenance

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.
- **Manual/CLI Verification:**
  - Vérifier les versions de Docker et Docker Compose : `docker version` et `docker compose version`
  - Vérifier que le service Docker est actif : `sudo systemctl status docker`
  - L'utilisateur de déploiement dédié doit pouvoir exécuter `docker ps` sans `sudo` après connexion.
  - L'exécution de `docker run hello-world` (sans sudo par l'utilisateur de déploiement) doit réussir.
  - Vérifier que le démon Docker utilise la configuration sécurisée : `docker info | grep -i default` doit montrer les paramètres configurés.
  - Tester que les règles iptables fonctionnent correctement avec Docker :
    ```bash
    # Démarrer un conteneur nginx exposant un port non autorisé (ex: 8080)
    docker run -d --name test-nginx -p 8080:80 nginx
    # Vérifier que le port n'est pas accessible depuis l'extérieur
    curl http://PUBLIC_IP:8080
    # Arrêter et supprimer le conteneur de test
    docker stop test-nginx && docker rm test-nginx
    # Démarrer un conteneur sur un port autorisé (ex: 80)
    docker run -d --name test-nginx -p 80:80 nginx
    # Vérifier que le port est accessible
    curl http://PUBLIC_IP
    # Nettoyer
    docker stop test-nginx && docker rm test-nginx
    ```
  - Vérifier que le socket Docker n'est pas exposé en réseau : `ss -tlnp | grep docker` ne devrait pas montrer d'écoute sur une interface réseau.
  - Vérifier la persistance des règles iptables après redémarrage du système (si possible).
  - Vérifier que la documentation a été mise à jour.
- _(Hint: Voir `docs/strategie-tests.md` pour l'approche globale)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
- **Change Log:**
  - Initial Draft

## Notes de sécurité additionnelles

- **Socket Docker** : Ne jamais exposer le socket Docker (/var/run/docker.sock) sur le réseau ou le monter dans des conteneurs sans contrôle d'accès strict.
- **Utilisateur dédié** : L'utilisateur de déploiement doit avoir les droits minimaux nécessaires pour effectuer ses tâches.
- **Mises à jour** : Mettre en place une stratégie de mise à jour régulière pour Docker Engine, les images de base et l'OS hôte.
- **Surveillance** : Envisager la mise en place d'outils de surveillance pour détecter les comportements anormaux (sera abordé dans une story ultérieure).
- **Pare-feu OVH Edge** : Considérer l'activation du pare-feu OVH Edge Network comme couche de protection supplémentaire (voir section II.B du rapport Docker sécurisé).
- **Pruning régulier** : Mettre en place un nettoyage régulier des images, volumes et conteneurs inutilisés pour éviter l'encombrement du système.
- **Gestion manuelle des règles iptables** : Si vous optez pour l'option 2 (désactiver la gestion iptables par Docker), soyez vigilant lors des mises à jour de Docker, car vous devrez gérer manuellement toutes les règles nécessaires à son fonctionnement.

Cette implémentation se concentre sur la sécurisation d'une installation Docker existante et suit les recommandations du rapport "Docker sécurisé sur VPS OVH" en utilisant iptables directement pour la gestion du pare-feu.