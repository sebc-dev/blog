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

Docker sera utilisé pour conteneuriser tous les composants de notre application.
(Source : `architecture-principale.txt`, `teck-stack.txt`)

1.  **Désinstaller les anciennes versions (si applicable) :**
    ```bash
    sudo apt-get remove docker docker-engine docker.io containerd runc
    ```
2.  **Configurer le dépôt Docker :**
    ```bash
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL [https://download.docker.com/linux/debian/gpg](https://download.docker.com/linux/debian/gpg) | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] [https://download.docker.com/linux/debian](https://download.docker.com/linux/debian) \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    ```
3.  **Installer Docker Engine :**
    ```bash
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    ```
    `docker-compose-plugin` installe la dernière version de Docker Compose (`docker compose` CLI V2).
4.  **Vérifier l'installation de Docker :**
    ```bash
    sudo docker run hello-world
    ```
5.  **Gérer Docker en tant qu'utilisateur non-root (Recommandé) :**
    Pour éviter de devoir utiliser `sudo` pour chaque commande `docker`, ajoutez votre utilisateur au groupe `docker`.
    ```bash
    sudo usermod -aG docker $USER
    ```
    Vous devrez vous déconnecter et vous reconnecter (ou exécuter `newgrp docker`) pour que ce changement prenne effet.
    **Attention :** L'ajout d'un utilisateur au groupe `docker` lui donne des privilèges équivalents à `root`. Assurez-vous de comprendre les implications de sécurité.

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
    ```bash
    docker compose up -d
    ```
5.  **Vérifier les Logs :**
    Consultez les logs pour s'assurer que les services ont démarré correctement.
    ```bash
    docker compose logs -f nom_service_frontend
    docker compose logs -f nom_service_backend
    ```
6.  **Migrations de Base de Données (si manuelles) :**
    Si Liquibase n'est pas configuré pour s'exécuter automatiquement au démarrage du backend :
    ```bash
    docker compose exec backend ./mvnw liquibase:update -Pprod # Assurez-vous d'utiliser le profil de production si nécessaire
    ```

### 2.4. Procédure de Rollback

En cas de problème suite à un déploiement :

1.  **Identifier la Version Stable Précédente :** Consultez l'historique des tags d'images dans votre registre de conteneurs (GHCR) ou l'historique des déploiements GitHub Actions.
2.  **Modifier les Tags d'Image (si nécessaire) :**
    * Si votre `docker-compose.prod.yml` utilise des tags spécifiques (ex: `monimage:1.2.3`), modifiez le fichier sur le VPS pour pointer vers les tags de la version stable précédente.
    * Si vous utilisez des tags flottants comme `latest` (non recommandé pour la production stable), vous devrez explicitement tirer une version précédente par son tag ou son digest.
3.  **Exécuter la Procédure de Déploiement Manuel (adaptée) :**
    ```bash
    cd /opt/blog-technique-bilingue
    # Si vous avez modifié docker-compose.prod.yml pour des tags spécifiques :
    docker compose pull # Pour tirer les images spécifiées
    docker compose up -d
    # Si vous devez forcer une image spécifique sans modifier le compose (moins propre) :
    # docker pull votreregistre/nom_service_backend:tag_stable_precedent
    # docker tag votreregistre/nom_service_backend:tag_stable_precedent votreregistre/nom_service_backend:tag_actuel_dans_compose
    # docker compose up -d --no-deps nom_service_backend # Redémarre seulement ce service
    ```
    La méthode la plus propre est de gérer les versions via des tags explicites dans le `docker-compose.prod.yml` et de versionner ce fichier ou ses mises à jour.
4.  **Vérifier l'Application :** Assurez-vous que l'application est revenue à un état stable.
*(Source : `architecture-principale.txt` - Mention du rollback)*

### 2.5. Gestion des Fichiers Statiques du Frontend

* Le frontend Astro génère des fichiers statiques. L'image Docker du frontend embarque ces fichiers ainsi qu'un serveur web léger (Nginx comme discuté, ou Caddy).
* Lors d'un nouveau déploiement du frontend, l'ancienne image Docker est remplacée par la nouvelle, contenant la nouvelle version des fichiers statiques. Il n'y a généralement pas de "migration" de données pour le frontend lui-même, seulement un remplacement de l'ensemble des fichiers.

## 3. Sauvegardes et Restauration

Une stratégie de sauvegarde et de restauration est cruciale pour assurer la continuité de service et la récupération des données en cas d'incident.

### 3.1. Sauvegardes au Niveau du VPS (OVH)

* **Confirmation :** Le PRD (`prd-blog-bilingue.txt`, section NFRs Fiabilité) confirme que le VPS OVH inclut une **sauvegarde quotidienne automatique du système de fichiers et de la base de données PostgreSQL**.
* **Portée OVH :** Ces sauvegardes gérées par OVH couvrent l'intégralité du VPS.
* **Procédures de Restauration OVH :** Consultez la documentation d'OVH Cloud.

### 3.2. Stratégie de Sauvegarde Spécifique à l'Application

* **Contenu (Articles MDX) :** Le dépôt Git est la source de vérité. `push` réguliers.
* **Base de Données PostgreSQL (Compteurs Anonymes) :** Couvertes par OVH. Sauvegardes `pg_dump` optionnelles pour plus de granularité (non prioritaire MVP).
* **Configuration Traefik (`acme.json`) :** Inclus dans les sauvegardes OVH via volume mappé. Permissions `chmod 600`.

### 3.3. Procédures de Restauration Applicative

1.  **Évaluation de l'Incident.**
2.  **Option 1 : Restauration à partir de Git** (redéploiement d'un commit stable).
3.  **Option 2 : Restauration de la Base de Données PostgreSQL** (via sauvegarde OVH ou `pg_dump`).
4.  **Option 3 : Restauration Complète du VPS via OVH.**

### 3.4. Tests de Restauration (Post-MVP)

Se familiariser avec la documentation OVH est un minimum pour le MVP.

## 4. Politique de Mise à Jour des Composants sur le VPS

Maintenir les logiciels du serveur à jour est crucial pour la sécurité et la stabilité.

### 4.1. Système d'Exploitation (Debian GNU/Linux)

* **Fréquence :** Sécurité (hebdomadaire), mineures (mensuelle).
* **Procédure :** `sudo apt update && sudo apt upgrade -y`. Redémarrage si nécessaire (noyau, glibc).

### 4.2. Docker Engine et Docker Compose Plugin

* **Fréquence :** Mensuelle ou trimestrielle.
* **Procédure :** Suivre documentation Docker, `sudo apt-get install --only-upgrade ...`, `sudo systemctl restart docker`.

### 4.3. Images Docker des Applications (Frontend, Backend, PostgreSQL, Traefik)

* **Images de Base :** Reconstruire les images applicatives avec les bases à jour mensuellement ou sur alerte de vulnérabilité.
* **Image Docker de Traefik :** Mettre à jour le tag dans `docker-compose.prod.yml` mensuellement/trimestriellement.
* **Images Applicatives :** Mises à jour à chaque déploiement CI/CD.

### 4.4. Planification et Communication

* Fenêtres de maintenance pour les mises à jour avec interruption.
* Tests si possible avant production.
* Stratégie de rollback.

## 5. Surveillance (Monitoring) et Gestion des Logs

Cette section décrit les procédures opérationnelles pour le MVP. Pour une stratégie d'observabilité complète et les évolutions post-MVP, référez-vous à `docs/observabilite/strategie-observabilite.md`.

### 5.1. Principes Généraux de Logging (MVP)

* **Collecte :** `stdout`/`stderr` des conteneurs capturés par Docker.
* **Driver :** `json-file`.
* **Rotation :** Gérée via `/etc/docker/daemon.json` (`max-size: "10m"`, `max-file: "3"`).
* **Accès :** Manuel via SSH et `docker compose logs <nom_service>`.
* **Pas d'Agrégation Centralisée MVP.**

### 5.2. Stratégies de Logging par Composant (MVP)

* **Backend Spring Boot :** JSON structuré. Niveaux : `INFO` (prod), `DEBUG` (dev). `docker compose logs -f nom_service_backend`.
* **Frontend Astro (Nginx) :** Logs d'accès Nginx (format combiné/personnalisé), erreurs Nginx (`error`/`warn`). `docker compose logs -f nom_service_frontend`.
* **Traefik :** Logs d'accès (JSON ou common), logs applicatifs (textuel ou JSON). Niveaux : `INFO`/`WARN`. `docker compose logs -f nom_service_traefik`.
* **PostgreSQL :** `stdout`/`stderr`. Paramètres clés (`postgresql.conf` ou env var) : `log_min_messages = WARNING`, `log_connections = on`, `log_min_duration_statement = 1000`, `log_lock_waits = on`, `log_statement = ddl`. `docker compose logs -f nom_service_database`.

### 5.3. Monitoring de Base (MVP)

* **Philosophie MVP :** Couverture manuelle des composants critiques.
* **Pas de Dashboards Centralisés ni d'Alerting Automatisé MVP.**

#### 5.3.1. Surveillance Système du VPS
    * **Outils :** `htop`, `vmstat`, `df -h`, `iostat`, `free -m`, `ss -tulnp` via SSH.
    * **Métriques :** CPU, mémoire, disque, réseau.

#### 5.3.2. Surveillance Applicative

* **Backend Spring Boot (Actuator) :**
    * **Accès :** `curl http://localhost:8080/actuator/health` (depuis VPS ou via tunnel SSH). Non exposé publiquement.
    * **Métriques :** Santé, requêtes HTTP (count, duration), JVM, pool DB, logs.
* **Frontend (Nginx/Traefik) :**
    * **Outils :** Analyse manuelle logs Nginx/Traefik. Google Analytics.
    * **Métriques :** Volume requêtes, taux erreurs 4xx/5xx, temps réponse.
* **PostgreSQL :**
    * **Outils :** Commandes `psql` (`\conninfo`, `pg_stat_activity`, etc.). Analyse logs.
    * **Métriques :** Connexions, requêtes lentes, transactions, taille DB, verrous.
* **Santé des Conteneurs Docker :**
    * **Outils :** `docker ps -a`, `docker stats`, `docker inspect`.
    * **Métriques :** Statut conteneurs, CPU/mémoire par conteneur.
    * **`HEALTHCHECK` Docker :** Recommandé pour Spring Boot et Nginx dans `docker-compose.yml`.

### 5.4. Analyse des Logs et Métriques pour le Diagnostic (MVP)
* Procédure : Identifier service -> `docker compose logs` -> filtrer -> corréler avec métriques.

## 6. Gestion des Incidents et Dépannage de Base (MVP)

Cette section décrit l'approche initiale pour la gestion des incidents et les étapes de dépannage de base.

### 6.1. Détection d'Incidents (MVP)
* Surveillance Manuelle, Retours Utilisateurs, Échecs de Déploiement, Vérification proactive Logs/Métriques.

### 6.2. Procédure Générale de Réponse aux Incidents (MVP)
1.  Accuser Réception et Qualification.
2.  Diagnostic Initial (logs, `docker ps`, `htop`, rollback si déploiement récent).
3.  Communication (Interne).
4.  Résolution (redémarrage conteneur, rollback, correction config, libération disque).
5.  Vérification.
6.  Post-Mortem (Simplifié MVP : journal d'opérations).

### 6.3. Scénarios de Dépannage Courants (MVP)

#### 6.3.1. Site Web Inaccessible
1.  Vérifier Traefik (logs, état conteneur).
2.  Vérifier conteneur Frontend/Nginx (logs, état).
3.  Vérifier DNS.
4.  Vérifier Pare-feu (`sudo iptables -L -v`).
5.  Vérifier Ressources VPS (`htop`, `df -h`).

#### 6.3.2. Fonctionnalités de Comptage en Panne
1.  Vérifier Logs Frontend (Console Navigateur, onglet Réseau).
2.  Vérifier Logs Backend (Spring Boot).
3.  Vérifier État Conteneur Backend (`docker ps`, `/actuator/health`).
4.  Vérifier Logs PostgreSQL.
5.  Vérifier Configuration URL API dans Frontend.

#### 6.3.3. Problèmes d'Affichage du Contenu (MDX)
1.  Vérifier Fichiers MDX Sources (Git, syntaxe frontmatter/contenu).
2.  Vérifier Logs de Build Frontend (GitHub Actions).
3.  Vérifier Logs Conteneur Frontend (Nginx).
4.  Inspecter Fichiers Générés (si possible via `docker exec`).

#### 6.3.4. Problèmes Certificats SSL
1.  Vérifier Logs Traefik (`grep -i acme`).
2.  Vérifier Configuration ACME Traefik (email, volume `acme.json` permissions `600`).
3.  Vérifier DNS et propagation.

## 7. Maintenance Préventive (MVP)

### 7.1. Revue Régulière des Logs
* **Fréquence :** Hebdomadaire.
* **Action :** Recherche d'erreurs récurrentes, avertissements.

### 7.2. Surveillance de l'Espace Disque
* **Fréquence :** Hebdomadaire.
* **Action :** `df -h`.

### 7.3. Vérification de l'Expiration des Certificats SSL
* **Fréquence :** Mensuelle (Traefik gère auto-renouvellement).
* **Action :** Vérifier logs Traefik, outils en ligne.

### 7.4. Revue des Sauvegardes (Compréhension)
* **Fréquence :** Ponctuelle.
* **Action :** Se familiariser avec console OVH.

### 7.5. Veille de Sécurité
* **Fréquence :** Continue / Mensuelle.
* **Action :** Se tenir informé des vulnérabilités des composants stack.

## 8. Change Log

| Date       | Version | Description                                                                                                                                                                                          | Auteur                            |
| :--------- | :------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------- |
| 2025-05-11 | 0.1     | Création initiale du Runbook Opérationnel. Sections incluses : Introduction, Prérequis et Configuration Initiale VPS, Procédures de Déploiement, Sauvegardes et Restauration, Politique de Mise à Jour. | 3 - Architecte (IA) & Utilisateur |
| 2025-05-11 | 0.2     | Ajout des sections Surveillance et Gestion des Logs (MVP), Gestion des Incidents et Dépannage de Base (MVP), et Maintenance Préventive (MVP), en alignement avec `strategie-observabilite.txt`.      | 3 - Architecte (IA) & Utilisateur |
| 2025-05-12 | 0.3     | Mise à jour section 1.1 pour utiliser `iptables-nft` au lieu de `ufw`, ajouter détails configuration SSH, 2FA, `unattended-upgrades` et vérification `fail2ban` conformément à `story1.md`. Mise à jour commande pare-feu section 6.3.1. | Gemini & Utilisateur              |