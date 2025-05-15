# Blog Technique Bilingue - Configuration de l'Environnement de Développement Local

Ce document décrit la configuration et les étapes nécessaires pour mettre en place l'environnement de développement local pour le projet "Blog Technique Bilingue". L'objectif est de fournir un environnement cohérent et facile à utiliser pour tous les développeurs.

## Vue d'Ensemble

L'environnement de développement local s'appuie fortement sur **Docker** et **Docker Compose** pour orchestrer les différents services (frontend Astro, backend Spring Boot, base de données PostgreSQL, Traefik). Cela garantit que l'environnement local est aussi proche que possible de l'environnement de production, tout en offrant des fonctionnalités de développement telles que le rechargement à chaud (hot-reloading). L'environnement de développement de référence pour ce guide est **Windows 11**.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les outils suivants sur votre machine Windows 11 :

1.  **Git:** Pour cloner le dépôt et gérer les versions du code. (Site officiel : [https://git-scm.com/](https://git-scm.com/))
2.  **Docker Desktop (avec WSL 2) :** Pour exécuter les conteneurs de l'application. Docker Desktop pour Windows utilise WSL 2 (Windows Subsystem for Linux) pour une meilleure performance et compatibilité. Assurez-vous que WSL 2 est installé et configuré comme backend pour Docker Desktop. Docker Desktop inclut Docker Compose. (Site officiel : [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/))
3.  **Node.js & PNPM (installés via WSL 2 ou directement sous Windows) :** Pour le développement du frontend Astro.
    * Node.js : Version LTS 22.x (ou la version spécifiée dans `frontend/package.json`). Nous recommandons d'utiliser un gestionnaire de versions Node comme `nvm` (pour Linux/macOS, ou `nvm-windows` pour Windows).
    * PNPM : Le gestionnaire de paquets utilisé pour le frontend. (Site officiel : [https://pnpm.io/](https://pnpm.io/))
        ```bash
        # Via npm (si Node.js est déjà installé)
        npm install -g pnpm
        # ou via corepack (inclus avec Node.js >= 16.10)
        # corepack enable
        # corepack prepare pnpm@<version> --activate
        ```
4.  **Java Development Kit (JDK) :** Pour le développement du backend Spring Boot.
    * Version : Java 21 (LTS) (ou la version spécifiée dans `backend/pom.xml`). (Ex: OpenJDK, Adoptium Temurin). Vous pouvez l'installer directement sous Windows.
5.  **Apache Maven :** Pour la gestion des dépendances et le build du backend Java. (Site officiel : [https://maven.apache.org/](https://maven.apache.org/)). Vous pouvez l'installer directement sous Windows et vous assurer qu'il est dans votre PATH.
6.  **IDE (Environnement de Développement Intégré) :**
    * **Cursor :** L'IDE principal pour le développement frontend (Astro/TypeScript) et backend (Java/Spring Boot). (Site officiel : [https://cursor.sh/](https://cursor.sh/))
    * Assurez-vous d'installer les extensions pertinentes dans Cursor pour Astro, TypeScript, Java, Spring Boot, ESLint, Prettier, etc.

## Configuration Initiale

1.  **Cloner le dépôt :**
    Utilisez Git Bash (installé avec Git pour Windows) ou votre terminal préféré.
    ```bash
    git clone <URL_DU_DEPOT_GIT>
    cd blog-technique-bilingue
    ```

2.  **Configurer les variables d'environnement locales :**
    * Copiez le fichier `.env.example` à la racine du projet en `.env` :
        ```bash
        # Depuis Git Bash ou un terminal compatible
        cp .env.example .env
        ```
    * Éditez le fichier `.env` avec Cursor et renseignez les valeurs nécessaires pour votre environnement local. Consultez `docs/setup/environnement-vars.md` pour une description détaillée de chaque variable.
        * Typiquement, pour PostgreSQL, vous devrez définir `POSTGRES_USER`, `POSTGRES_PASSWORD`, et `POSTGRES_DB`.
        * Les URLs des services (frontend, backend) seront généralement gérées via Docker Compose et Traefik avec des noms de service.

3.  **Installer les dépendances du frontend :**
    Naviguez dans le répertoire `frontend/` et installez les dépendances avec PNPM. Si vous utilisez WSL 2 pour Node.js/PNPM, faites-le depuis un terminal WSL.
    ```bash
    cd frontend
    pnpm install
    cd ..
    ```

4.  **Configuration des hooks Git (optionnel mais recommandé) :**
    Si Husky est configuré dans le projet (répertoire `.husky/`), il est généralement installé avec les dépendances du projet (via `package.json`). Assurez-vous qu'il est exécutable.
    ```bash
    # Depuis la racine du projet, dans un terminal approprié (WSL si Node est dans WSL)
    # npx husky install # si pas fait automatiquement
    ```

## Lancement de l'Environnement avec Docker Compose

La majorité des services sont gérés par Docker Compose via Docker Desktop, mais suivant la nouvelle structure du projet, chaque service dispose de son propre fichier Compose dédié.

1.  **Démarrer le proxy Traefik :**
    Depuis le répertoire `infra/proxy/` :
    ```bash
    cd infra/proxy
    docker compose up -d
    ```
    Cette commande va démarrer le service Traefik qui agira comme reverse proxy pour rediriger les requêtes vers les services appropriés.

2.  **Démarrer la stack d'application (backend, frontend, base de données) :**
    Depuis le répertoire `infra/site/` :
    ```bash
    cd infra/site
    docker compose up -d
    ```
    Cette commande va :
    * Construire les images Docker pour le frontend et le backend si elles n'existent pas déjà (basé sur les `Dockerfile` respectifs).
    * Démarrer les conteneurs pour :
        * Le **backend Spring Boot** (avec rechargement à chaud si configuré via Spring Boot DevTools).
        * La **base de données PostgreSQL**. Les données seront persistées dans un volume Docker.
        * Le **frontend Astro** en mode développement (avec rechargement à chaud).

    Le **reverse proxy Traefik**, préalablement démarré, exposera les services sur des URLs locales (ex: `http://localhost` pour le frontend, `http://localhost/api` pour le backend, ou des sous-domaines comme `http://blog.localhost`).

3.  **Alternative : utiliser Docker Desktop pour démarrer les services :**
    Vous pouvez également utiliser l'interface graphique de Docker Desktop pour démarrer et arrêter les services. Naviguez jusqu'aux différents répertoires contenant les fichiers `docker-compose.yml` et démarrez les services via l'interface.

4.  **Vérifier les logs des conteneurs :**
    Vous pouvez utiliser l'interface de Docker Desktop pour voir les logs des conteneurs, ou utiliser la ligne de commande depuis le répertoire de chaque service :
    ```bash
    # Pour les services de l'application (dans le répertoire infra/site)
    docker compose logs -f backend
    docker compose logs -f frontend
    
    # Pour Traefik (dans le répertoire infra/proxy)
    docker compose logs -f
    ```

5.  **Accéder aux applications :**
    * **Frontend (Astro) :** Généralement accessible sur `http://localhost:4321` (port par défaut d'Astro en dev) ou via l'URL configurée par Traefik (ex: `http://localhost` ou `http://blog.localhost`). Vérifiez la configuration de Traefik et les logs.
    * **Backend (Spring Boot API) :** Généralement accessible via Traefik sur un chemin spécifique (ex: `http://localhost/api/v1/...` ou `http://api.blog.localhost/api/v1/...`). Le port direct du service backend (ex: 8080) pourrait aussi être exposé pour un accès direct en local si configuré dans le fichier Compose.
    * **Traefik Dashboard :** Si activé et configuré, le dashboard de Traefik est souvent sur `http://localhost:8081` (ou un autre port pour éviter les conflits, le port 8080 étant souvent utilisé par Spring Boot).
    * **Base de données PostgreSQL :** Le port (par défaut `5432`) est généralement exposé sur l'hôte pour permettre la connexion avec des outils de gestion de base de données (ex: pgAdmin, DBeaver, ou les outils intégrés à Cursor). Les identifiants sont ceux définis dans votre fichier `.env`.

## Flux de Travail de Développement avec Cursor

### Développement Frontend (Astro)

1.  Ouvrez le dossier `frontend/` ou le dossier racine du projet dans Cursor.
2.  Les modifications apportées aux fichiers sources (`.astro`, `.ts`, `.mdx`, `.css`) dans `frontend/src/` devraient déclencher automatiquement le rechargement à chaud (hot-reloading) dans votre navigateur si le serveur de développement Astro est correctement lancé via Docker Compose.
3.  Vous pouvez utiliser le terminal intégré de Cursor pour exécuter les commandes PNPM si vous préférez gérer le serveur de développement Astro en dehors de Docker pour un contrôle plus fin (assurez-vous que l'API backend est accessible). Exécutez ces commandes depuis le répertoire `frontend/`.
    ```bash
    pnpm dev # Lance le serveur de dev Astro
    pnpm build # Construit le site statique
    pnpm preview # Prévisualise le build statique
    pnpm test:unit # Lance les tests unitaires Vitest
    pnpm test:e2e # Lance les tests E2E Cypress (nécessite un environnement fonctionnel)
    ```

### Développement Backend (Spring Boot)

1.  Ouvrez le dossier `backend/` ou le dossier racine du projet dans Cursor.
2.  Si Spring Boot DevTools est inclus et configuré dans `pom.xml`, les modifications apportées au code Java dans `backend/src/main/java/` devraient déclencher un redémarrage automatique de l'application Spring Boot au sein du conteneur Docker.
3.  Pour un débogage plus avancé, vous pouvez exécuter l'application Spring Boot directement depuis Cursor sur votre machine Windows.
    * Assurez-vous que Cursor est configuré avec le JDK Java 21.
    * Configurez les profils de lancement dans Cursor pour utiliser les variables d'environnement de votre fichier `.env` ou un profil Spring spécifique (`application-dev.yml`).
    * Assurez-vous que la base de données PostgreSQL (lancée via Docker Compose ou localement) est accessible.
4.  Commandes Maven utiles (à exécuter depuis le répertoire `backend/` via le terminal intégré de Cursor) :
    ```bash
    # Sur Windows, utilisez mvnw.cmd si le wrapper est utilisé
    ./mvnw.cmd clean install # Compile, teste et package l'application
    ./mvnw.cmd spring-boot:run # Lance l'application Spring Boot
    ./mvnw.cmd test # Exécute les tests unitaires et d'intégration
    ./mvnw.cmd liquibase:update # Applique les migrations Liquibase (si configuré pour être manuel)
    ```

## Arrêt de l'Environnement

Pour arrêter tous les services Docker Compose via Docker Desktop ou en ligne de commande :
```bash
docker compose down
```

Pour arrêter et supprimer les volumes (attention, cela supprimera les données de la base de données PostgreSQL locale si le volume est anonyme ou listé pour suppression) :

Bash

```
docker compose down -v
```

## Dépannage (Troubleshooting) sous Windows 11

- **WSL 2 et Docker Desktop :** Assurez-vous que WSL 2 est correctement installé, à jour, et défini comme le moteur par défaut pour Docker Desktop. Des problèmes de performance ou de montage de volume peuvent survenir si ce n'est pas le cas.
- **Chemins de fichiers :** Faites attention aux différences de chemins entre Windows et les environnements Linux dans les conteneurs (par exemple, lors du montage de volumes dans Docker Compose).
- **Antivirus/Pare-feu :** L'antivirus ou le pare-feu de Windows peuvent parfois interférer avec Docker Desktop ou les connexions réseau entre conteneurs ou avec l'hôte. Vérifiez les configurations si vous rencontrez des problèmes de connectivité.
- **Conflits de ports :** Si un port requis est déjà utilisé sur votre machine, Docker Compose ou les services individuels ne pourront pas démarrer. Vérifiez les messages d'erreur et modifiez les ports dans les fichiers `docker-compose.override.yml` ou les configurations des services si nécessaire.
- **Problèmes de build Docker :** Vérifiez les `Dockerfile` et les messages d'erreur lors du build.
- **Dépendances :** Assurez-vous que toutes les dépendances (Node, PNPM, JDK, Maven) sont correctement installées et aux versions requises, que ce soit sous Windows directement ou dans l'environnement WSL 2 si vous l'utilisez pour certains outils.
- **Variables d'environnement :** Vérifiez que votre fichier `.env` est correctement configuré et lu par les services.
- **Logs Docker :** `docker compose logs -f <nom_du_service>` (ou via Docker Desktop) reste essentiel pour diagnostiquer les problèmes au démarrage des conteneurs.

## Change Log

|   |   |   |   |   |
|---|---|---|---|---|
|**Change**|**Date**|**Version**|**Description**|**Author**|
|Initial draft|2025-05-11|0.1|Création initiale du guide de l'environnement dev.|3 - Architecte (IA)|
|Update|2025-05-11|0.2|Ajout de Cursor comme IDE principal et Windows 11 comme OS de référence.|3 - Architecte (IA) & Utilisateur|
