# Blog Technique Bilingue - Runbook Opérationnel

## Introduction et Objectifs

Ce Runbook Opérationnel fournit les procédures standardisées pour la gestion, la maintenance, le déploiement, et le dépannage du "Blog Technique Bilingue" hébergé sur le VPS OVH. Il est destiné aux administrateurs système et aux développeurs responsables des opérations du site.

**Objectifs Principaux :**

- **Standardisation :** Fournir des instructions claires et cohérentes pour les tâches opérationnelles courantes.
- **Fiabilité :** Assurer la disponibilité et la performance du blog en documentant les procédures de maintenance et de surveillance.
- **Récupération :** Guider les actions à entreprendre en cas d'incident ou de besoin de restauration (bien que les sauvegardes complètes soient gérées par OVH, des procédures de restauration applicative pourraient être nécessaires).
- **Sécurité :** Maintenir un environnement sécurisé en décrivant les bonnes pratiques de configuration et de mise à jour.
- **Efficacité :** Réduire le temps nécessaire pour diagnostiquer et résoudre les problèmes.

Ce document est un guide vivant et sera mis à jour au fur et à mesure de l'évolution du système et des procédures.

## 1. Prérequis et Configuration Initiale du VPS

Cette section détaille les étapes pour préparer le serveur privé virtuel (VPS) OVH existant (fonctionnant sous Debian GNU/Linux) avant le déploiement de l'application "Blog Technique Bilingue".

### 1.1. Accès au VPS et Sécurité de Base

- **Accès SSH :**
  - L'accès au VPS se fait via SSH. Il est impératif d'utiliser des **clés SSH** pour l'authentification plutôt que des mots de passe.
  - Le serveur SSH doit être configuré avec `PasswordAuthentication no`, `ChallengeResponseAuthentication no` et `PermitRootLogin no` (voir `docs/specs/epic1/story1.md` pour les fichiers de config).
  - (Optionnel) La 2FA TOTP peut être activée pour les comptes administrateurs.
  - Assurez-vous que l'utilisateur qui sera utilisé pour les déploiements (via GitHub Actions ou manuellement) a les droits `sudo` nécessaires (ou est ajouté au groupe `docker` pour gérer Docker sans `sudo` à chaque commande).
- **Mise à Jour Initiale du Système & Mises à Jour Automatiques :**
  Une fois connecté en SSH, mettez à jour la liste des paquets et le système :
  ```bash
  sudo apt update && sudo apt full-upgrade -y
  ```
  Installez et configurez les mises à jour automatiques pour la sécurité :
  ```bash
  sudo apt install unattended-upgrades apt-listchanges -y
  sudo dpkg-reconfigure --priority=low unattended-upgrades
  ```
- **Configuration du Pare-feu (`iptables-nft`) :**
  Nous utilisons `iptables` avec le backend `nftables`.
  1.  Assurez-vous que le backend `nftables` est utilisé :
      ```bash
      sudo iptables -V
      # Devrait afficher "(nf_tables)". Sinon: sudo update-alternatives --config iptables
      ```
  2.  Définir les politiques par défaut :
      ```bash
      sudo iptables -P INPUT DROP
      sudo iptables -P FORWARD DROP
      sudo iptables -P OUTPUT ACCEPT
      ```
  3.  Autoriser le trafic loopback et les connexions établies :
      ```bash
      sudo iptables -A INPUT -i lo -j ACCEPT
      sudo iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
      ```
  4.  Autoriser le trafic ICMP (ping) :
      ```bash
      sudo iptables -A INPUT -p icmp -j ACCEPT
      ```
  5.  Autoriser les connexions SSH (port 22 par défaut, adaptez si port personnalisé) :
      ```bash
      sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
      ```
  6.  Autoriser le trafic HTTP (port 80) et HTTPS (port 443), qui sera géré par Traefik :
      ```bash
      sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
      sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
      ```
  7.  Installer `iptables-persistent` pour sauvegarder les règles :
      ```bash
      sudo apt install iptables-persistent netfilter-persistent -y
      # Accepter de sauvegarder les règles actuelles lors de l'installation.
      sudo netfilter-persistent save
      sudo systemctl enable netfilter-persistent
      ```
  8.  Vérifier les règles chargées :
      ```bash
      sudo iptables -L -v
      ```
      Vous devriez voir les règles configurées.
- **Installation d'Outils Essentiels (si non présents) :**
  ```bash
  sudo apt install -y curl wget git vim fail2ban
  ```
  - `fail2ban` est un outil de prévention des intrusions qui surveille les logs et bloque les IPs suspectes (tentatives de brute-force SSH, etc.). Sa configuration spécifique (jail `sshd`, `bantime`, `maxretry`) est définie dans `/etc/fail2ban/jail.local` (voir `docs/specs/epic1/story1.md`).
  - Vérifiez son statut :
    ```bash
    sudo systemctl status fail2ban
    sudo fail2ban-client status sshd
    ```

### 1.2. Installation de Docker Engine et Docker Compose

Cette section détaille l'installation de Docker Engine et du plugin Docker Compose v2 sur le serveur VPS Debian, conformément à la Story 1.2. Docker sera utilisé pour conteneuriser tous les composants de notre application.
Les versions spécifiques (Docker Engine ~28.1.1, Docker Compose plugin v2 ~2.36.0) sont à vérifier dans `docs/architecture/tech-stack.md`.

Suivez les instructions officielles de Docker pour l'installation sur Debian.

**1. Préparation du système :**

- Désinstallez les anciennes versions de Docker si présentes (optionnel, mais recommandé pour une installation propre) :
  ```bash
  sudo apt-get remove docker docker-engine docker.io containerd runc
  ```
- Mettez à jour l'index des paquets `apt` :
  ```bash
  sudo apt-get update
  ```
- Installez les paquets prérequis :
  ```bash
  sudo apt-get install -y ca-certificates curl gnupg lsb-release
  ```

**2. Ajout du dépôt GPG officiel de Docker :**

- Créez le répertoire pour les clés GPG si ce n'est pas déjà fait :
  ```bash
  sudo mkdir -p /etc/apt/keyrings
  ```
- Téléchargez la clé GPG de Docker :
  ```bash
  curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  ```
  Assurez-vous que le fichier `/etc/apt/keyrings/docker.gpg` a les bonnes permissions (ex: `sudo chmod a+r /etc/apt/keyrings/docker.gpg`).

**3. Configuration du dépôt Docker :**

- Ajoutez le dépôt Docker aux sources APT :
  ```bash
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
    $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  ```

**4. Installation de Docker Engine et Docker Compose :**

- Mettez à jour l'index des paquets `apt` (après ajout du nouveau dépôt) :
  ```bash
  sudo apt-get update
  ```
- Installez Docker Engine, containerd, le plugin Docker Buildx et le plugin Docker Compose :
  ```bash
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  ```

**5. Vérification de l'installation de Docker Engine :**

- Démarrez le service Docker et activez-le au démarrage du système :
  ```bash
  sudo systemctl start docker
  sudo systemctl enable docker
  ```
- Vérifiez que le service Docker est actif :
  ```bash
  sudo systemctl status docker
  ```
- Vérifiez que Docker Engine est correctement installé en exécutant l'image `hello-world` :
  ```bash
  sudo docker run hello-world
  ```
- Vérifiez la version de Docker Engine :
  ```bash
  docker version
  ```
  Cette commande devrait afficher les versions du client et du serveur Docker.

**6. Gérer Docker en tant qu'utilisateur non-root (Post-installation) :**

Pour éviter de devoir utiliser `sudo` pour chaque commande `docker`, ajoutez votre utilisateur de déploiement (par exemple, celui utilisé par la CI/CD ou votre utilisateur courant pour la gestion) au groupe `docker`.

- Le groupe `docker` est créé automatiquement lors de l'installation de Docker. Vous pouvez le vérifier avec `getent group docker`.
- Ajoutez l'utilisateur au groupe `docker` (remplacez `$USER` par le nom d'utilisateur spécifique si nécessaire) :
  ```bash
  sudo usermod -aG docker $USER
  ```
- Appliquez les nouveaux membres du groupe. Vous devrez vous déconnecter et vous reconnecter de votre session SSH pour que les changements de groupe prennent effet, ou exécuter la commande suivante (cela affecte uniquement le shell courant) :
  ```bash
  newgrp docker
  ```
- Vérifiez que la commande `docker` peut être exécutée sans `sudo` :
  ```bash
  docker run hello-world
  # ou
  docker ps
  ```
  **Attention :** L'ajout d'un utilisateur au groupe `docker` lui donne des privilèges équivalents à `root` sur le système hôte car il peut interagir avec le daemon Docker. Assurez-vous de comprendre les implications de sécurité et n'ajoutez que des utilisateurs de confiance à ce groupe.

**7. Vérification de l'installation de Docker Compose :**

- Vérifiez la version de Docker Compose (plugin V2) :
  ```bash
  docker compose version
  ```
  Cette commande devrait afficher la version du plugin Docker Compose.

(Source : `docs/specs/epic1/story2.md`, `architecture-principale.txt`, `teck-stack.txt`)

### 1.2.1 Configuration et Sécurisation de Docker (Post-Installation)

Cette section détaille la vérification, l'authentification et la sécurisation d'une installation Docker Engine (v28.1.1) et Docker Compose (v2.35.1) existante, comme décrit dans `docs/specs/epic1/story2.md`.

**1. Vérification des Versions Installées :**

Assurez-vous que les versions correctes sont installées et actives :

```bash
# Vérifier la version de Docker Engine
docker version
# S'attendre à voir Client et Server version ~28.1.1

# Vérifier la version de Docker Compose
docker compose version
# S'attendre à voir version ~v2.35.1

# Vérifier que le service Docker est actif
sudo systemctl status docker
```

**2. Configuration de l'Authentification Docker Hub :**

Pour éviter les limites de taux de Docker Hub, configurez l'authentification.

- Créez un token d'accès sur [Docker Hub](https://hub.docker.com/signup) (Account Settings > Security > New Access Token).
- Connectez-vous en utilisant votre nom d'utilisateur et le token d'accès comme mot de passe :
  ```bash
  docker login -u VOTRE_NOM_UTILISATEUR_DOCKER_HUB
  # Entrez le token d'accès lorsque le mot de passe est demandé.
  # Le fichier ~/.docker/config.json sera créé ou mis à jour.
  ```
- Vérifiez l'authentification :
  ```bash
  docker pull hello-world
  docker run hello-world
  ```

**3. Configuration Sécurisée du Démon Docker (`/etc/docker/daemon.json`) :**

Créez ou modifiez le fichier `/etc/docker/daemon.json` pour renforcer la sécurité du démon Docker.

- Créez le répertoire si nécessaire :
  ```bash
  sudo mkdir -p /etc/docker
  ```
- Configurez `/etc/docker/daemon.json` :
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
- Redémarrez Docker pour appliquer les changements :
  ```bash
  sudo systemctl restart docker
  ```
- Vérifiez que les paramètres sont appliqués :
  ```bash
  docker info | grep -i "Default Runtime\\|Live Restore\\|Logging Driver"
  ```

**Explication des paramètres de `daemon.json` :** - `log-driver` et `log-opts`: Limite la taille des logs pour éviter de saturer le disque. - `default-ulimits`: Augmente la limite de fichiers ouverts. - `live-restore`: Permet aux conteneurs de continuer à fonctionner pendant un redémarrage du démon Docker. - `userland-proxy`: Désactivé pour utiliser directement iptables, améliorant les performances réseau. - `no-new-privileges`: Empêche les conteneurs d'acquérir de nouveaux privilèges.

**4. Vérification de l'Interaction Docker-iptables :**

Assurez-vous que Docker interagit correctement avec `iptables`.

- Examinez les règles `iptables` :
  ```bash
  sudo iptables -L -v -n
  sudo iptables -t nat -L -v -n
  ```
- Vérifiez la présence des chaînes Docker (DOCKER, DOCKER-USER, etc.) :
  ```bash
  sudo iptables -t filter -L DOCKER -n
  sudo iptables -t nat -L DOCKER -n
  ```
- Testez avec un conteneur :
  ```bash
  docker run -d --name test-nginx -p 8080:80 nginx
  sudo iptables -t nat -L -n | grep 8080 # Vérifier la règle de redirection
  curl http://localhost:8080            # Tester l'accès
  docker stop test-nginx && docker rm test-nginx # Nettoyer
  ```

**5. Création d'un Utilisateur de Déploiement Dédié (`deploy-user`) :**

Créez un utilisateur non-root pour les déploiements avec des permissions limitées.

- Créez l'utilisateur :
  ```bash
  sudo adduser deploy-user --disabled-password
  ```
- Configurez l'accès SSH par clé pour `deploy-user` (remplacez `SSH_PUBLIC_KEY` par la clé publique réelle) :
  ```bash
  sudo mkdir -p /home/deploy-user/.ssh
  sudo sh -c 'echo "SSH_PUBLIC_KEY" > /home/deploy-user/.ssh/authorized_keys'
  sudo chown -R deploy-user:deploy-user /home/deploy-user/.ssh
  sudo chmod 700 /home/deploy-user/.ssh
  sudo chmod 600 /home/deploy-user/.ssh/authorized_keys
  ```
- Ajoutez `deploy-user` au groupe `docker` :
  ```bash
  sudo usermod -aG docker deploy-user
  ```
  Cela permet à `deploy-user` d'exécuter les commandes `docker` sans `sudo`.
- Configurez des permissions `sudo` limitées via `/etc/sudoers.d/deploy-user` :
  ```bash
  sudo visudo -f /etc/sudoers.d/deploy-user
  ```
  Contenu du fichier :
  ```
  # Permissions Docker pour l'utilisateur de déploiement
  deploy-user ALL=(ALL) NOPASSWD: /usr/bin/systemctl status docker, /usr/bin/systemctl restart docker, /usr/bin/docker info, /usr/bin/journalctl -u docker, /usr/bin/grep -r "" /etc/docker/, /usr/bin/cat /etc/docker/*, /usr/bin/apt-get update, /usr/bin/apt-get upgrade -y docker*
  # Permissions pour vérifier la configuration système
  deploy-user ALL=(ALL) NOPASSWD: /usr/bin/ss -tulpn, /usr/bin/iptables -L -n, /usr/bin/iptables -t nat -L -n, /usr/bin/df -h, /usr/bin/du -sh /var/lib/docker*
  ```
  Puis, sécurisez le fichier :
  ```bash
  sudo chmod 440 /etc/sudoers.d/deploy-user
  ```
- Configurez l'authentification Docker Hub pour `deploy-user` :

  ```bash
  # Option 1: Copier la configuration de l'utilisateur actuel (si login fait avec cet user)
  sudo mkdir -p /home/deploy-user/.docker
  sudo cp ~/.docker/config.json /home/deploy-user/.docker/
  sudo chown -R deploy-user:deploy-user /home/deploy-user/.docker

  # Option 2: Se connecter en tant que deploy-user et s'authentifier
  # sudo -u deploy-user -i
  # docker login
  # exit
  ```

**6. Nettoyage Automatisé des Ressources Docker :**

Mettez en place un nettoyage périodique des conteneurs, images, volumes et réseaux inutilisés.

- Créez le script `/usr/local/bin/docker-cleanup.sh` :
  ```bash
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
  ```
- Rendez le script exécutable :
  ```bash
  sudo chmod +x /usr/local/bin/docker-cleanup.sh
  ```
- Ajoutez une tâche cron hebdomadaire (ex: tous les dimanches à 2h du matin) :
  ```bash
  echo "0 2 * * 0 root /usr/local/bin/docker-cleanup.sh > /var/log/docker-cleanup.log 2>&1" | sudo tee /etc/cron.d/docker-cleanup
  ```

**7. Bonnes Pratiques de Sécurité Docker Supplémentaires :**

- **Socket Docker :** Le socket Docker (`/var/run/docker.sock`) ne doit jamais être exposé sur le réseau ou monté dans des conteneurs sans contrôle d'accès strict.
- **Authentification Docker Hub :** Préférez les tokens d'accès aux mots de passe et envisagez une rotation régulière des tokens.
- **Utilisateur de déploiement :** Les permissions `sudo` limitées pour `deploy-user` suivent le principe du moindre privilège.
- **Mises à jour régulières :** Planifiez des mises à jour régulières de Docker Engine et des images de base de vos conteneurs.

(Source : `docs/specs/epic1/story2.md`)

### 1.3. Préparation de la Structure de Déploiement

Après avoir configuré l'accès SSH et installé Docker Engine + Docker Compose, la prochaine étape consiste à préparer la structure de répertoire sur le VPS pour accueillir les différents services du blog technique bilingue. Cette structure suit les bonnes pratiques pour un déploiement Docker dans `/srv`.

**1. Création de la structure de répertoires :**

```bash
# Créer la structure principale
sudo mkdir -p /srv/docker
sudo mkdir -p /srv/docker/proxy
sudo mkdir -p /srv/docker/proxy/traefik_data
sudo mkdir -p /srv/docker/apps/site
sudo mkdir -p /srv/docker/apps/site/data
sudo mkdir -p /srv/docker/backups

# Définir les permissions appropriées
sudo chmod 750 /srv/docker
```

**2. Configuration de l'utilisateur de déploiement :**

Assurez-vous que l'utilisateur qui sera utilisé pour les déploiements (via GitHub Actions ou manuellement) a les permissions nécessaires sur ces répertoires :

```bash
# Remplacez 'deployer' par le nom d'utilisateur effectif utilisé pour le déploiement
# Si vous utilisez un groupe dédié (ex: 'deployers'), ajustez en conséquence
sudo chown -R root:deployer /srv/docker
# Permettre à l'utilisateur de déploiement d'écrire dans les répertoires nécessaires
sudo chmod -R g+w /srv/docker/proxy
sudo chmod -R g+w /srv/docker/apps
```

**3. Création des fichiers de configuration Traefik (proxy) :**

Créez le fichier de configuration Traefik principal :

```bash
sudo nano /srv/docker/proxy/traefik_data/traefik.yml
```

Contenu recommandé pour `traefik.yml` :

```yaml
# Traefik static configuration
global:
  sendAnonymousUsage: false # Désactiver la télémétrie

# Configuration des points d'entrée (HTTP/HTTPS)
entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
  websecure:
    address: ":443"

# Activation du tableau de bord (optionnel, sécurisé par auth en prod)
api:
  dashboard: true
  insecure: false # Ne pas activer en prod sans auth

# Logs
log:
  level: "INFO" # DEBUG, INFO, WARN, ERROR, FATAL
  filePath: "/var/log/traefik.log" # Si monté en volume

# Certificats Let's Encrypt
certificatesResolvers:
  myresolver:
    acme:
      email: "${TRAEFIK_ACME_EMAIL}"
      storage: "/acme.json"
      tlsChallenge: {}

# Configuration des providers
providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false # Sécurité : ne pas exposer tous les conteneurs par défaut
    network: "webproxy_net"
    swarmMode: false
    watch: true
    # Ne gérer que les conteneurs avec le label spécifique
    constraints: "Label(`myapp.traefik.managed`, `true`)"
```

**4. Création du fichier pour les certificats ACME :**

```bash
sudo mkdir -p /srv/docker/proxy/letsencrypt
sudo touch /srv/docker/proxy/letsencrypt/acme.json
sudo chmod 600 /srv/docker/proxy/letsencrypt/acme.json
```

**5. Création du docker-compose.yml pour Traefik :**

```bash
sudo nano /srv/docker/proxy/docker-compose.yml
```

Contenu adapté de `docker-compose.yml` pour Traefik :

```yaml
version: "3.9"

########################
# Réseau externe commun
########################
networks:
  webproxy_net:
    external: true

########################
# Services
########################
services:
  traefik:
    image: traefik:v3.4.0
    container_name: traefik
    restart: unless-stopped
    security_opt:
      - "no-new-privileges:true"

    ####################
    # Ports publiés
    ####################
    ports:
      - "80:80"
      - "443:443"

    ####################
    # Commandes de configuration
    ####################
    command:
      - "--log.level=INFO"
      - "--accesslog=true"
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
      - "--entrypoints.web.http.redirections.entrypoint.scheme=https"
      - "--entrypoints.web.http.redirections.entrypoint.permanent=true"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.myresolver.acme.dnschallenge=true"
      - "--certificatesresolvers.myresolver.acme.dnschallenge.provider=ovh"
      - "--certificatesresolvers.myresolver.acme.email=${LETSENCRYPT_EMAIL}"
      - "--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json"

    ####################
    # Variables d'environnement
    ####################
    environment:
      - "OVH_ENDPOINT=${OVH_ENDPOINT_CONFIG}"
      - "OVH_APPLICATION_KEY_FILE=/run/secrets/ovh_app_key_secret"
      - "OVH_APPLICATION_SECRET_FILE=/run/secrets/ovh_app_secret_secret"
      - "OVH_CONSUMER_KEY_FILE=/run/secrets/ovh_consumer_key_secret"

    ####################
    # Volumes montés
    ####################
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt

    ####################
    # Secrets
    ####################
    secrets:
      - ovh_app_key_secret
      - ovh_app_secret_secret
      - ovh_consumer_key_secret
      - traefik_dashboard_credentials_secret

    ####################
    # Labels (dashboard)
    ####################
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik.rule=Host(`${TRAEFIK_SUBDOMAIN}.${MY_DOMAIN}`)"
      - "traefik.http.routers.traefik.entrypoints=websecure"
      - "traefik.http.routers.traefik.service=api@internal"
      - "traefik.http.routers.traefik.tls.certresolver=myresolver"
      # Authentification Basic Auth (recommandé en production)
      - "traefik.http.routers.traefik.middlewares=dashboard-auth@docker"
      - "traefik.http.middlewares.dashboard-auth.basicauth.usersfile=/run/secrets/traefik_dashboard_credentials_secret"

    networks:
      - webproxy_net

########################
# Secrets
########################
secrets:
  ovh_app_key_secret:
    file: ./secrets/ovh_app_key.txt
  ovh_app_secret_secret:
    file: ./secrets/ovh_app_secret.txt
  ovh_consumer_key_secret:
    file: ./secrets/ovh_consumer_key.txt
  traefik_dashboard_credentials_secret:
    file: ./secrets/traefik_dashboard_credentials.txt
```

**6. Création du docker-compose.yml pour l'application :**

```bash
sudo nano /srv/docker/apps/site/docker-compose.prod.yml
```

Contenu du `docker-compose.prod.yml` pour l'application :

```yaml
version: "3.9"

########################
# Réseaux
########################
networks:
  webproxy_net:
    external: true
  site_net:
    name: site_net

########################
# Volumes
########################
volumes:
  pgdata:
    name: pgdata

########################
# Services
########################
services:
  frontend:
    image: ghcr.io/ORGANISATION/site-astro:latest
    container_name: blog-frontend
    restart: unless-stopped
    networks:
      - webproxy_net
    labels:
      - "traefik.enable=true"
      - "myapp.traefik.managed=true"
      - "traefik.http.routers.frontend.rule=Host(`${TRAEFIK_DOMAIN_MAIN}`)"
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.routers.frontend.tls.certresolver=myresolver"
      - "traefik.http.services.frontend.loadbalancer.server.port=80"

  backend:
    image: ghcr.io/ORGANISATION/site-api:latest
    container_name: blog-backend
    restart: unless-stopped
    depends_on:
      - db
    networks:
      - webproxy_net
      - site_net
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/${POSTGRES_DB}
      - SPRING_DATASOURCE_USERNAME=${POSTGRES_USER}
      - SPRING_DATASOURCE_PASSWORD=${POSTGRES_PASSWORD}
    labels:
      - "traefik.enable=true"
      - "myapp.traefik.managed=true"
      - "traefik.http.routers.backend.rule=Host(`${TRAEFIK_DOMAIN_MAIN}`) && PathPrefix(`/api`)"
      - "traefik.http.routers.backend.entrypoints=websecure"
      - "traefik.http.routers.backend.tls.certresolver=myresolver"
      - "traefik.http.services.backend.loadbalancer.server.port=8080"

  db:
    image: postgres:16.4-alpine
    container_name: blog-db
    restart: unless-stopped
    networks:
      - site_net
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
      - PGDATA=/var/lib/postgresql/data/pgdata
```

**7. Création des fichiers .env pour chaque service :**

Pour Traefik :

```bash
sudo nano /srv/docker/proxy/.env
```

Contenu minimal du fichier `.env` pour Traefik :

```
LETSENCRYPT_EMAIL=contact@votre-domaine.com
MY_DOMAIN=votre-domaine.com
TRAEFIK_SUBDOMAIN=traefik
OVH_ENDPOINT_CONFIG=ovh-europe
```

Pour l'application :

```bash
sudo nano /srv/docker/apps/site/.env
```

Contenu minimal du fichier `.env` pour l'application :

```
POSTGRES_USER=bloguser
POSTGRES_PASSWORD=MotDePasseTresTresSecret
POSTGRES_DB=blog_db
TRAEFIK_DOMAIN_MAIN=votre-domaine.com
```

**8. Sécurisation des fichiers de configuration :**

Assurez-vous que les fichiers `.env` sont correctement protégés :

```bash
sudo chmod 600 /srv/docker/proxy/.env
sudo chmod 600 /srv/docker/apps/site/.env
```

**9. Création du réseau Docker pour Traefik :**

Créez le réseau Docker qui sera utilisé par Traefik pour communiquer avec les services :

```bash
docker network create webproxy_net
```

Référence : `docs/specs/epic1/story3.md` pour les détails complets de la configuration Traefik et la structure des répertoires.

### 1.4. Configuration de GitHub Container Registry (GHCR)

Pour permettre au VPS de télécharger les images Docker depuis GitHub Container Registry (GHCR), vous devez configurer l'authentification Docker sur le serveur.

**1. Créez un Personal Access Token (PAT) GitHub avec les permissions appropriées :**

- Connectez-vous à votre compte GitHub
- Accédez à `Settings` > `Developer settings` > `Personal access tokens` > `Tokens (classic)`
- Cliquez sur `Generate new token`
- Cochez au minimum les permissions suivantes : `read:packages` (pour pull d'images)
- Notez le token généré (il n'est affiché qu'une fois)

**2. Configurez Docker sur le VPS pour s'authentifier auprès de GHCR :**

```bash
# Connexion à GHCR (entrez votre nom d'utilisateur GitHub et le PAT comme mot de passe)
echo "VOTRE_PAT_GITHUB" | docker login ghcr.io -u VOTRE_USERNAME_GITHUB --password-stdin

# Vérifiez que le fichier d'authentification est créé
ls -la ~/.docker/config.json

# Si l'utilisateur de déploiement n'est pas celui qui a exécuté la commande ci-dessus
# copiez le fichier config.json vers son répertoire home (si nécessaire)
sudo mkdir -p /home/deployer/.docker
sudo cp ~/.docker/config.json /home/deployer/.docker/
sudo chown -R deployer:deployer /home/deployer/.docker
```

Remarque : Dans un environnement de production, envisagez d'utiliser un compte technique GitHub dédié pour cette authentification, plutôt qu'un compte personnel.

## 2. Procédures de Déploiement

Cette section détaille les procédures de déploiement sur le VPS OVH, majoritairement automatisées via GitHub Actions mais aussi manuelles en cas de besoin.

### 2.1. Déploiement automatisé via GitHub Actions

Le déploiement principal est géré par GitHub Actions comme décrit dans `docs/ci-cd/pipeline.md`. Voici un résumé du processus pour référence :

1. Le développeur pousse du code sur la branche `main` ou effectue un merge de PR vers `main`.
2. GitHub Actions déclenche les workflows qui :
   - Construisent les applications frontend et backend
   - Exécutent les tests
   - Construisent des images Docker et les poussent vers GHCR
   - Se connectent au VPS via SSH
   - Mettent à jour les conteneurs en exécutant des commandes `docker compose pull && docker compose up -d`

**Vérification après déploiement automatisé :**

```bash
# Connexion au VPS
ssh user@vps-hostname

# Vérification de l'état des conteneurs
cd /srv/docker/proxy/
docker compose ps
cd /srv/docker/apps/site/
docker compose -f docker-compose.prod.yml ps

# Vérification des logs récents
docker compose -f docker-compose.prod.yml logs --tail=50 frontend
docker compose -f docker-compose.prod.yml logs --tail=50 backend
```

### 2.2. Déploiement manuel (si nécessaire)

Si un déploiement manuel est nécessaire (par exemple, en cas de problème avec GitHub Actions), procédez comme suit :

**1. Pour Traefik (proxy) :**

```bash
# Se connecter au VPS
ssh user@vps-hostname

# Accéder au répertoire du proxy
cd /srv/docker/proxy/

# Vérifier que le fichier .env et les configs sont à jour
ls -la

# Redémarrer Traefik (ou le démarrer s'il n'est pas encore en cours d'exécution)
docker compose down
docker compose up -d

# Vérifier l'état
docker compose ps
docker compose logs --tail=20
```

**2. Pour l'application (frontend, backend, db) :**

```bash
# Accéder au répertoire de l'application
cd /srv/docker/apps/site/

# Mettre à jour les images depuis GHCR
docker compose -f docker-compose.prod.yml pull

# Redémarrer les services avec les nouvelles images
docker compose -f docker-compose.prod.yml up -d

# Vérifier l'état
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=50
```

**3. Déploiement sélectif d'un seul service :**
Si vous devez déployer un service spécifique sans affecter les autres :

```bash
# Par exemple, pour mettre à jour uniquement le frontend
cd /srv/docker/apps/site/
docker compose -f docker-compose.prod.yml pull frontend
docker compose -f docker-compose.prod.yml up -d frontend

# Ou pour le backend
docker compose -f docker-compose.prod.yml pull backend
docker compose -f docker-compose.prod.yml up -d backend
```

### 2.3. Rollback vers une version antérieure

En cas de problème avec une nouvelle version, vous pouvez effectuer un rollback vers une version précédente connue pour être stable.

```bash
cd /srv/docker/apps/site/

# Option 1: Spécifier une version précédente précise dans le docker-compose.prod.yml
# Éditez le fichier pour remplacer "latest" par un tag de version spécifique
# Par exemple: ghcr.io/ORGANISATION/site-astro:v1.0.2
sudo nano docker-compose.prod.yml

# Option 2: Utiliser une commande pour spécifier la version
# Remplacez TAG par le tag de la version connue comme stable (ex: v1.0.2, un SHA spécifique, etc.)
TAG=v1.0.2
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### 2.4. Comment vérifier l'état du déploiement

Après un déploiement (automatique ou manuel), vérifiez l'état du système :

**1. Vérification de base des conteneurs :**

```bash
cd /srv/docker/apps/site/
docker compose -f docker-compose.prod.yml ps
```

Tous les conteneurs doivent avoir le statut "Up" sans redémarrages récents.

**2. Vérification des logs pour détecter d'éventuelles erreurs :**

```bash
# Logs du frontend
docker compose -f docker-compose.prod.yml logs --tail=50 frontend

# Logs du backend
docker compose -f docker-compose.prod.yml logs --tail=50 backend

# Logs de la base de données (en cas de problème de connexion)
docker compose -f docker-compose.prod.yml logs --tail=50 db
```

**3. Vérification du fonctionnement du site :**

- Accédez au site web depuis un navigateur et vérifiez que la page d'accueil se charge correctement.
- Testez la navigation entre les pages et les fonctionnalités de base.
- Vérifiez que les fonctionnalités qui impliquent l'API backend fonctionnent (votes d'utilité, partages).
- Vérifiez que le site est accessible en français et en anglais.

**4. Vérification de Traefik :**

```bash
cd /srv/docker/proxy/
docker compose logs --tail=50
```

Assurez-vous que les routes sont correctement configurées et que les certificats SSL sont valides.
