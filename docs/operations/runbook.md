# Blog Technique Bilingue - Runbook Opérationnel

## Introduction et Objectifs

Ce Runbook Opérationnel fournit les procédures standardisées pour la gestion, la maintenance, le déploiement, et le dépannage du "Blog Technique Bilingue" hébergé sur le VPS OVH. Il est destiné aux administrateurs système et aux développeurs responsables des opérations du site.

**Objectifs Principaux :**

* **Standardisation :** Fournir des instructions claires et cohérentes pour les tâches opérationnelles courantes.
* **Fiabilité :** Assurer la disponibilité et la performance du blog en documentant les procédures de maintenance et de surveillance.
* **Récupération :** Guider les actions à entreprendre en cas d'incident ou de besoin de restauration (bien que les sauvegardes complètes soient gérées par OVH, des procédures de restauration applicative pourraient être nécessaires).
* **Sécurité :** Maintenir un environnement sécurisé en décrivant les bonnes pratiques de configuration et de mise à jour.
* **Efficacité :** Réduire le temps nécessaire pour diagnostiquer et résoudre les problèmes.

Ce document est un guide vivant et sera mis à jour au fur et à mesure de l'évolution du système et des procédures.

## 1. Prérequis et Configuration Initiale du VPS

Cette section détaille les étapes pour préparer le serveur privé virtuel (VPS) OVH existant (fonctionnant sous Debian GNU/Linux) avant le déploiement de l'application "Blog Technique Bilingue".

### 1.1. Accès au VPS et Sécurité de Base

* **Accès SSH :**
    * L'accès au VPS se fait via SSH. Il est impératif d'utiliser des **clés SSH** pour l'authentification plutôt que des mots de passe.
    * Le serveur SSH doit être configuré avec `PasswordAuthentication no`, `ChallengeResponseAuthentication no` et `PermitRootLogin no` (voir `docs/specs/epic1/story1.md` pour les fichiers de config).
    * (Optionnel) La 2FA TOTP peut être activée pour les comptes administrateurs.
    * Assurez-vous que l'utilisateur qui sera utilisé pour les déploiements (via GitHub Actions ou manuellement) a les droits `sudo` nécessaires (ou est ajouté au groupe `docker` pour gérer Docker sans `sudo` à chaque commande).
* **Mise à Jour Initiale du Système & Mises à Jour Automatiques :**
    Une fois connecté en SSH, mettez à jour la liste des paquets et le système :
    ```bash
    sudo apt update && sudo apt full-upgrade -y
    ```
    Installez et configurez les mises à jour automatiques pour la sécurité :
    ```bash
    sudo apt install unattended-upgrades apt-listchanges -y
    sudo dpkg-reconfigure --priority=low unattended-upgrades
    ```
* **Configuration du Pare-feu (`iptables-nft`) :**
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
* **Installation d'Outils Essentiels (si non présents) :**
    ```bash
    sudo apt install -y curl wget git vim fail2ban
    ```
    * `fail2ban` est un outil de prévention des intrusions qui surveille les logs et bloque les IPs suspectes (tentatives de brute-force SSH, etc.). Sa configuration spécifique (jail `sshd`, `bantime`, `maxretry`) est définie dans `/etc/fail2ban/jail.local` (voir `docs/specs/epic1/story1.md`).
    * Vérifiez son statut :
      ```bash
      sudo systemctl status fail2ban
      sudo fail2ban-client status sshd
      ```

### 1.2. Installation de Docker Engine et Docker Compose

Cette section détaille l'installation de Docker Engine et du plugin Docker Compose v2 sur le serveur VPS Debian, conformément à la Story 1.2. Docker sera utilisé pour conteneuriser tous les composants de notre application.
Les versions spécifiques (Docker Engine ~28.1.1, Docker Compose plugin v2 ~2.36.0) sont à vérifier dans `docs/architecture/tech-stack.md`.

Suivez les instructions officielles de Docker pour l'installation sur Debian.

**1. Préparation du système :**

*   Désinstallez les anciennes versions de Docker si présentes (optionnel, mais recommandé pour une installation propre) :
    ```bash
    sudo apt-get remove docker docker-engine docker.io containerd runc
    ```
*   Mettez à jour l'index des paquets `apt` :
    ```bash
    sudo apt-get update
    ```
*   Installez les paquets prérequis :
    ```bash
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    ```

**2. Ajout du dépôt GPG officiel de Docker :**

*   Créez le répertoire pour les clés GPG si ce n'est pas déjà fait :
    ```bash
    sudo mkdir -p /etc/apt/keyrings
    ```
*   Téléchargez la clé GPG de Docker :
    ```bash
    curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    ```
    Assurez-vous que le fichier `/etc/apt/keyrings/docker.gpg` a les bonnes permissions (ex: `sudo chmod a+r /etc/apt/keyrings/docker.gpg`).

**3. Configuration du dépôt Docker :**

*   Ajoutez le dépôt Docker aux sources APT :
    ```bash
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    ```

**4. Installation de Docker Engine et Docker Compose :**

*   Mettez à jour l'index des paquets `apt` (après ajout du nouveau dépôt) :
    ```bash
    sudo apt-get update
    ```
*   Installez Docker Engine, containerd, le plugin Docker Buildx et le plugin Docker Compose :
    ```bash
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    ```

**5. Vérification de l'installation de Docker Engine :**

*   Démarrez le service Docker et activez-le au démarrage du système :
    ```bash
    sudo systemctl start docker
    sudo systemctl enable docker
    ```
*   Vérifiez que le service Docker est actif :
    ```bash
    sudo systemctl status docker
    ```
*   Vérifiez que Docker Engine est correctement installé en exécutant l'image `hello-world` :
    ```bash
    sudo docker run hello-world
    ```
*   Vérifiez la version de Docker Engine :
    ```bash
    docker version
    ```
    Cette commande devrait afficher les versions du client et du serveur Docker.

**6. Gérer Docker en tant qu'utilisateur non-root (Post-installation) :**

Pour éviter de devoir utiliser `sudo` pour chaque commande `docker`, ajoutez votre utilisateur de déploiement (par exemple, celui utilisé par la CI/CD ou votre utilisateur courant pour la gestion) au groupe `docker`.

*   Le groupe `docker` est créé automatiquement lors de l'installation de Docker. Vous pouvez le vérifier avec `getent group docker`.
*   Ajoutez l'utilisateur au groupe `docker` (remplacez `$USER` par le nom d'utilisateur spécifique si nécessaire) :
    ```bash
    sudo usermod -aG docker $USER
    ```
*   Appliquez les nouveaux membres du groupe. Vous devrez vous déconnecter et vous reconnecter de votre session SSH pour que les changements de groupe prennent effet, ou exécuter la commande suivante (cela affecte uniquement le shell courant) :
    ```bash
    newgrp docker
    ```
*   Vérifiez que la commande `docker` peut être exécutée sans `sudo` :
    ```bash
    docker run hello-world
    # ou
    docker ps
    ```
    **Attention :** L'ajout d'un utilisateur au groupe `docker` lui donne des privilèges équivalents à `root` sur le système hôte car il peut interagir avec le daemon Docker. Assurez-vous de comprendre les implications de sécurité et n'ajoutez que des utilisateurs de confiance à ce groupe.

**7. Vérification de l'installation de Docker Compose :**

*   Vérifiez la version de Docker Compose (plugin V2) :
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

*   Créez un token d'accès sur [Docker Hub](https://hub.docker.com/signup) (Account Settings > Security > New Access Token).
*   Connectez-vous en utilisant votre nom d'utilisateur et le token d'accès comme mot de passe :
    ```bash
    docker login -u VOTRE_NOM_UTILISATEUR_DOCKER_HUB
    # Entrez le token d'accès lorsque le mot de passe est demandé.
    # Le fichier ~/.docker/config.json sera créé ou mis à jour.
    ```
*   Vérifiez l'authentification :
    ```bash
    docker pull hello-world
    docker run hello-world
    ```

**3. Configuration Sécurisée du Démon Docker (`/etc/docker/daemon.json`) :**

Créez ou modifiez le fichier `/etc/docker/daemon.json` pour renforcer la sécurité du démon Docker.

*   Créez le répertoire si nécessaire :
    ```bash
    sudo mkdir -p /etc/docker
    ```
*   Configurez `/etc/docker/daemon.json` :
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
*   Redémarrez Docker pour appliquer les changements :
    ```bash
    sudo systemctl restart docker
    ```
*   Vérifiez que les paramètres sont appliqués :
    ```bash
    docker info | grep -i "Default Runtime\\|Live Restore\\|Logging Driver"
    ```

**Explication des paramètres de `daemon.json` :**
    -   `log-driver` et `log-opts`: Limite la taille des logs pour éviter de saturer le disque.
    -   `default-ulimits`: Augmente la limite de fichiers ouverts.
    -   `live-restore`: Permet aux conteneurs de continuer à fonctionner pendant un redémarrage du démon Docker.
    -   `userland-proxy`: Désactivé pour utiliser directement iptables, améliorant les performances réseau.
    -   `no-new-privileges`: Empêche les conteneurs d'acquérir de nouveaux privilèges.

**4. Vérification de l'Interaction Docker-iptables :**

Assurez-vous que Docker interagit correctement avec `iptables`.

*   Examinez les règles `iptables` :
    ```bash
    sudo iptables -L -v -n
    sudo iptables -t nat -L -v -n
    ```
*   Vérifiez la présence des chaînes Docker (DOCKER, DOCKER-USER, etc.) :
    ```bash
    sudo iptables -t filter -L DOCKER -n
    sudo iptables -t nat -L DOCKER -n
    ```
*   Testez avec un conteneur :
    ```bash
    docker run -d --name test-nginx -p 8080:80 nginx
    sudo iptables -t nat -L -n | grep 8080 # Vérifier la règle de redirection
    curl http://localhost:8080            # Tester l'accès
    docker stop test-nginx && docker rm test-nginx # Nettoyer
    ```

**5. Création d'un Utilisateur de Déploiement Dédié (`deploy-user`) :**

Créez un utilisateur non-root pour les déploiements avec des permissions limitées.

*   Créez l'utilisateur :
    ```bash
    sudo adduser deploy-user --disabled-password
    ```
*   Configurez l'accès SSH par clé pour `deploy-user` (remplacez `SSH_PUBLIC_KEY` par la clé publique réelle) :
    ```bash
    sudo mkdir -p /home/deploy-user/.ssh
    sudo sh -c 'echo "SSH_PUBLIC_KEY" > /home/deploy-user/.ssh/authorized_keys'
    sudo chown -R deploy-user:deploy-user /home/deploy-user/.ssh
    sudo chmod 700 /home/deploy-user/.ssh
    sudo chmod 600 /home/deploy-user/.ssh/authorized_keys
    ```
*   Ajoutez `deploy-user` au groupe `docker` :
    ```bash
    sudo usermod -aG docker deploy-user
    ```
    Cela permet à `deploy-user` d'exécuter les commandes `docker` sans `sudo`.
*   Configurez des permissions `sudo` limitées via `/etc/sudoers.d/deploy-user` :
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
*   Configurez l'authentification Docker Hub pour `deploy-user` :
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

*   Créez le script `/usr/local/bin/docker-cleanup.sh` :
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
*   Rendez le script exécutable :
    ```bash
    sudo chmod +x /usr/local/bin/docker-cleanup.sh
    ```
*   Ajoutez une tâche cron hebdomadaire (ex: tous les dimanches à 2h du matin) :
    ```bash
    echo "0 2 * * 0 root /usr/local/bin/docker-cleanup.sh > /var/log/docker-cleanup.log 2>&1" | sudo tee /etc/cron.d/docker-cleanup
    ```

**7. Bonnes Pratiques de Sécurité Docker Supplémentaires :**

*   **Socket Docker :** Le socket Docker (`/var/run/docker.sock`) ne doit jamais être exposé sur le réseau ou monté dans des conteneurs sans contrôle d'accès strict.
*   **Authentification Docker Hub :** Préférez les tokens d'accès aux mots de passe et envisagez une rotation régulière des tokens.
*   **Utilisateur de déploiement :** Les permissions `sudo` limitées pour `deploy-user` suivent le principe du moindre privilège.
*   **Mises à jour régulières :** Planifiez des mises à jour régulières de Docker Engine et des images de base de vos conteneurs.

(Source : `docs/specs/epic1/story2.md`)

### 1.3. Création de la Structure de Répertoires sur le VPS

Nous aurons besoin d'une structure de base pour stocker les fichiers de configuration de l'application et les données persistantes des conteneurs.

1.  **Répertoire Principal de l'Application :**
    Créez un répertoire où les fichiers `docker-compose.yml` et les configurations spécifiques à l'environnement de production seront stockés (par exemple, le fichier `.env` de production).
    ```bash
    sudo mkdir -p /opt/blog-technique-bilingue/data
    sudo chown -R $USER:$USER /opt/blog-technique-bilingue # Adaptez $USER si un utilisateur de déploiement dédié est utilisé
    cd /opt/blog-technique-bilingue
    ```
    Ce répertoire `/opt/blog-technique-bilingue` contiendra :
    * `docker-compose.prod.yml` (ou `docker-compose.yml` s'il est spécifique à la prod)
    * `.env` (contenant les variables d'environnement de production, **avec permissions restrictives**)
    * Le sous-répertoire `data/` pourra être utilisé pour les volumes persistants Docker si nécessaire (ex: données Traefik pour les certificats Let's Encrypt, données PostgreSQL).

### 1.4. Configuration Initiale de Traefik (sera gérée via Docker Compose)

L'installation et la configuration de Traefik se feront principalement via son image Docker et un fichier de configuration dynamique ou des labels Docker dans le `docker-compose.yml` de production. Les points clés à préparer sont :

* **Réseau Docker pour Traefik :** Un réseau Docker dédié (ex: `traefik_proxy`) sera créé pour que Traefik puisse communiquer avec les conteneurs qu'il gère.
* **Fichier de configuration statique de Traefik (`traefik.yml` ou via arguments CLI dans Docker Compose) :** Définira les points d'entrée (HTTP, HTTPS), les fournisseurs de services (Docker), et la configuration pour Let's Encrypt (ACME).
* **Volume pour les certificats Let's Encrypt :** Un volume Docker persistant sera utilisé pour stocker les certificats SSL/TLS afin qu'ils ne soient pas perdus lors des redémarrages de Traefik. Par exemple : `/opt/blog-technique-bilingue/data/traefik/acme.json`. Ce fichier devra avoir des permissions restrictives (`chmod 600`).

Les détails spécifiques de la configuration de Traefik seront dans le fichier `docker-compose.prod.yml` (ou équivalent) et potentiellement un fichier `traefik.dynamic.yml` si une configuration dynamique est utilisée.

## 2. Procédures de Déploiement

Le déploiement de l'application "Blog Technique Bilingue" est automatisé via un pipeline CI/CD utilisant **GitHub Actions**. Ce pipeline est responsable du build, des tests, de la création des images Docker, et du déploiement des nouvelles versions sur le VPS OVH.

### 2.1. Vue d'Ensemble du Pipeline de Déploiement (CI/CD avec GitHub Actions)

Le pipeline est typiquement déclenché par un `push` ou un `merge` sur la branche principale (ex: `main`). Les étapes générales sont les suivantes (détaillées dans `docs/ci-cd/pipeline.md`) :

1.  **Checkout du Code :** Récupération de la dernière version du code depuis le dépôt GitHub.
2.  **Setup des Environnements de Build :** Installation de Node.js/PNPM (pour le frontend Astro) et JDK/Maven (pour le backend Spring Boot).
3.  **Exécution des Tests :**
    * Tests unitaires et d'intégration pour le frontend (Vitest).
    * Tests unitaires et d'intégration pour le backend (JUnit, Mockito, Spring Test).
    * Analyse de sécurité des dépendances et des images Docker (Trivy).
    * (Optionnel, selon configuration) Tests E2E (Cypress).
4.  **Build des Applications :**
    * Frontend : Génération des fichiers statiques du site Astro (`pnpm build`).
    * Backend : Compilation de l'application Spring Boot en un fichier JAR exécutable (`./mvnw package`).
5.  **Build des Images Docker :**
    * Création d'une image Docker pour le frontend (intégrant les fichiers statiques et un serveur Nginx).
    * Création d'une image Docker pour le backend (intégrant le JAR de l'application Java).
    * Les images sont taguées (ex: avec le hash du commit ou un numéro de version).
6.  **Push des Images Docker :** Les images construites sont poussées vers un registre de conteneurs (ex: **GitHub Container Registry (GHCR)**).
7.  **Déploiement sur le VPS :**
    * GitHub Actions se connecte au VPS via SSH (en utilisant une clé SSH configurée dans les secrets GitHub).
    * Sur le VPS, un script de déploiement est exécuté. Ce script :
        * Navigue vers le répertoire de l'application (ex: `/opt/blog-technique-bilingue`).
        * S'assure que le fichier `docker-compose.prod.yml` (ou équivalent) et le fichier `.env` de production sont présents et corrects.
        * Effectue un `docker compose pull` pour récupérer les nouvelles versions des images depuis GHCR.
        * Effectue un `docker compose up -d` pour redémarrer les services avec les nouvelles images. Traefik détectera les nouveaux conteneurs et mettra à jour le routage.
        * (Si applicable) Exécute les migrations de base de données via Liquibase (peut être une étape dans le `docker compose up` du backend si Liquibase est configuré pour s'exécuter au démarrage, ou une commande `docker compose exec backend ./mvnw liquibase:update` appelée par le script).

*(Référence : `architecture-principale.txt` - Stratégie de Déploiement)*

### 2.2. Prérequis pour le Déploiement sur le VPS

Avant le premier déploiement automatisé, ou en cas de reconfiguration :

* **Clé SSH pour GitHub Actions :**
    * Une paire de clés SSH doit être générée. La clé publique sera ajoutée au fichier `~/.ssh/authorized_keys` de l'utilisateur de déploiement sur le VPS.
    * La clé privée sera stockée en tant que "secret" dans les paramètres du dépôt GitHub Actions (ex: `VPS_SSH_PRIVATE_KEY`).
* **Utilisateur de Déploiement sur le VPS :**
    * Un utilisateur dédié pour les déploiements est recommandé (ex: `deployer`). Cet utilisateur doit pouvoir exécuter des commandes `docker` (faire partie du groupe `docker`) et avoir les droits d'écriture sur les répertoires nécessaires (ex: `/opt/blog-technique-bilingue`).
* **Fichiers de Configuration sur le VPS :**
    * Le répertoire `/opt/blog-technique-bilingue/` doit être créé.
    * Un fichier `docker-compose.prod.yml` (ou son nom définitif) doit y être placé. Ce fichier définit les services, les images à utiliser (qui seront tirées de GHCR), les réseaux, les volumes, et les variables d'environnement (qui peuvent pointer vers le fichier `.env`).
    * Un fichier `.env` contenant les secrets de production (identifiants de base de données, clés API, etc.) doit être créé dans `/opt/blog-technique-bilingue/` avec des permissions restrictives (`chmod 600`). **Ce fichier n'est PAS versionné dans Git.**
* **Configuration de Traefik :**
    * Le `docker-compose.prod.yml` doit inclure la configuration du service Traefik, y compris le montage des volumes pour la configuration statique (si fichier `traefik.yml`), la configuration dynamique (si `traefik.dynamic.yml`), et le stockage des certificats ACME (`acme.json` avec `chmod 600`).

### 2.3. Procédure de Déploiement Manuel (Fallback ou Dépannage)

Bien que le déploiement soit automatisé, il est utile de connaître la procédure manuelle :

1.  **Accès SSH au VPS :** Connectez-vous au VPS en tant qu'utilisateur ayant les droits Docker.
2.  **Naviguer vers le Répertoire de l'Application :**
    ```bash
    cd /opt/blog-technique-bilingue
    ```
3.  **Mettre à Jour les Images Docker :**
    Récupérez les dernières versions des images (ou une version spécifique si rollback) depuis le registre de conteneurs.
    ```bash
    docker compose pull nom_service_frontend nom_service_backend
    # Ou pour tous les services définis dans le docker-compose.yml :
    # docker compose pull
    ```
    (Assurez-vous que le `docker-compose.prod.yml` référence les bons tags d'image si vous ne tirez pas `latest`).
4.  **Redémarrer les Services :**
    Appliquez les changements en redémarrant les services. Docker Compose ne recréera que les conteneurs dont l'image ou la configuration a changé.
    ```