# Story 1.13: Docker Compose Base pour Dev Local

**Status:** Draft (Révisé)

## Goal & Context

**User Story:** En tant que Développeur (Dev), je veux créer un fichier `docker-compose.yml` de base pour orchestrer les services (frontend, backend, db, traefik) en dev local afin de faciliter le lancement et la gestion de l'environnement de développement local complet.

**Context:** Cette story est la dernière de l'Epic 1 et rassemble tous les composants d'infrastructure précédents (VPS setup, Docker, Traefik, PostgreSQL, Frontend Astro, Backend Spring Boot). Elle permet aux développeurs de lancer l'ensemble de l'application avec une seule commande pour un développement et des tests locaux efficaces, en suivant les bonnes pratiques actuelles.

## Detailed Requirements

Créer un fichier `docker-compose.yml` à la racine du projet. Ce fichier définira les services pour le frontend, le backend, la base de données (`db`), et `traefik`. Il devra :

-   Gérer les builds des images Docker pour le frontend et le backend (en utilisant leurs Dockerfiles respectifs, qui devront assurer une exécution avec des utilisateurs non-root).
-   Utiliser des versions d'images à jour et supportées pour les services externes (Traefik, PostgreSQL).
-   Configurer les réseaux Docker pour la communication inter-services de manière sécurisée.
-   Monter les volumes nécessaires (persistance DB, configuration et certificats Traefik, code source pour le hot-reloading).
-   Charger les variables d'environnement depuis un fichier `.env` (qui doit être inclus dans `.gitignore`).
-   Exposer les ports nécessaires pour le développement local, principalement via Traefik.
-   Implémenter des healthchecks pour les services critiques.
-   Configurer Traefik pour utiliser des certificats auto-signés pour le développement local en HTTPS sur `localhost`.
-   Sécuriser le dashboard Traefik par authentification.

Un fichier `docker-compose.override.yml` pourra être utilisé pour les surcharges spécifiques au développement (ex: exposition directe de ports, outils de débogage).

## Acceptance Criteria (ACs)

-   AC1: Un fichier `docker-compose.yml` est créé à la racine du projet, sans le champ `version` obsolète.
-   AC2: Le fichier définit les services suivants :
    -   `frontend`: Build à partir de `frontend/Dockerfile` (configuré pour utilisateur non-root et images de base minimales), monte le code source pour le hot-reloading, expose son port au réseau Docker pour Traefik. Comprend un healthcheck.
    -   `backend`: Build à partir de `backend/Dockerfile` (configuré pour utilisateur non-root et images de base minimales), monte le code source pour le hot-reloading (si Spring Boot DevTools est configuré comme dépendance de développement uniquement), expose son port au réseau Docker pour Traefik. Dépend de `db` (avec condition `service_healthy`). Comprend un healthcheck.
    -   `db`: Utilise une image PostgreSQL récente (ex: `postgres:17.x-alpine` ou dernier patch `16.y-alpine`), configure les variables d'environnement, monte un volume pour la persistance des données. Comprend un healthcheck.
    -   `traefik`: Utilise une image Traefik récente (ex: `traefik:v3.4.x` ou `v3.3.y`), monte sa configuration statique, les certificats auto-signés et la configuration dynamique, monte le socket Docker en lecture seule (`:ro`), expose les ports 80/443. Le dashboard est activé, sécurisé par authentification et accessible via un routeur HTTPS.
-   AC3: Des réseaux Docker sont définis (`webproxy_net`, `internal_net` avec `internal: true`) et utilisés pour permettre la communication entre Traefik et les services applicatifs, et entre le backend et la base de données.
-   AC4: Les variables d'environnement sont chargées à partir d'un fichier `.env` à la racine du projet. Ce fichier `.env` est listé dans `.gitignore`.
-   AC5: Les ports des services sont mappés à l'hôte principalement via Traefik (80/443). L'exposition directe de ports applicatifs (ex: Astro dev server 4321, Spring Boot 8080) est optionnelle et gérée via `docker-compose.override.yml`.
-   AC6: La commande `docker compose up --build` (ou `docker compose -f docker-compose.yml -f docker-compose.override.yml up --build` si un override est utilisé) démarre tous les services avec succès, en respectant les healthchecks.
-   AC7: Un fichier `docker-compose.override.yml` est documenté avec des exemples concrets (ex: ports de débogage, activation de profils spécifiques, exposition directe de ports pour frontend/backend en dev).
-   AC8: Les Dockerfiles du frontend et backend sont configurés pour utiliser des utilisateurs non-root.
-   AC9: Le dashboard Traefik est accessible uniquement en HTTPS via un routeur dédié et protégé par une authentification BasicAuth.

## Technical Implementation Context

**Guidance:** Écrire le `docker-compose.yml` en s'assurant que chaque service est correctement configuré pour le développement sécurisé et performant. Utiliser BuildKit pour les builds Docker. S'assurer de la cohérence des versions avec `teck-stack.md`.

-   **Relevant Files:**
    -   Files to Create/Modify:
        -   `docker-compose.yml` (à la racine)
        -   `docker-compose.override.yml` (optionnel, à la racine, avec exemples fournis)
        -   `.env` (s'assurer qu'il contient toutes les variables nécessaires, incluant celles pour l'authentification du dashboard Traefik, et qu'il est dans `.gitignore`)
        -   `frontend/Dockerfile` (mise à jour pour utilisateur non-root, image de base minimale)
        -   `backend/Dockerfile` (mise à jour pour utilisateur non-root, image de base minimale, build multi-stage)
        -   `traefik_dynamic_conf/dynamic_conf.yml` (pour la configuration des certificats auto-signés de Traefik)
        -   `dev-certs/` (répertoire pour stocker les certificats auto-signés, ex: `localhost.crt`, `localhost.key`)
        -   `.dockerignore` pour frontend et backend (bien configurés).
    -   _(Hint: Se référer à `docs/project-structure.md`, `docs/setup/environnement-dev.md` (à créer), et aux Dockerfiles des Story 1.9 et 1.12. Les configurations de Traefik (Story 1.3) et PostgreSQL (Story 1.4) seront intégrées ici, en respectant les mises à jour de sécurité et de version. Le document `docs/teck-stack.md` doit être la source de vérité pour les versions d'images.)_
-   **Key Technologies:**
    -   Docker Compose (Compose Specification)
    -   Docker (avec BuildKit activé)
    -   Traefik (version à jour, ex: v3.4.x), PostgreSQL (version à jour, ex: 17.x-alpine), Astro, Spring Boot (en tant que services)
    -   Certificats auto-signés (ex: via `mkcert` ou `openssl`) pour HTTPS local.
    -   _(Hint: Voir `docs/teck-stack.md` pour les versions exactes. Envisager `docker compose watch` pour des optimisations futures du hot-reloading.)_
-   **API Interactions / SDK Usage:**
    -   Les services interagissent via les réseaux Docker configurés.
-   **UI/UX Notes:**
    -   Permet au développeur d'accéder facilement au frontend (via `https://www.localhost` ou domaine configuré) et potentiellement aux dashboards (Traefik sécurisé, Actuator).
    -   La double exposition du port du frontend (directe et via Traefik) sera clarifiée : l'accès direct est optionnel (via `docker-compose.override.yml`) pour le développement rapide, l'accès via Traefik pour les tests d'intégration.
-   **Data Structures:**
    -   Gère les volumes pour la persistance des données de la DB et des certificats/configuration de Traefik.
-   **Environment Variables:**
    -   Toutes les variables listées dans `docs/environnement-vars.md` pertinentes pour le dev local doivent être dans `.env` et référencées dans `docker-compose.yml`.
    -   Nouvelles variables pour Traefik : `TRAEFIK_DASHBOARD_USER`, `TRAEFIK_DASHBOARD_HASHED_PASSWORD`.
    -   La variable `LETSENCRYPT_EMAIL` est supprimée si non utilisée pour des domaines publics.
    -   _(Hint: Voir `docs/environnement-vars.md`)_
-   **Coding Standards Notes:**
    -   Le `docker-compose.yml` doit être clair, bien commenté et utiliser les meilleures pratiques Docker Compose (y compris le pinning strict des versions d'images au patchlevel).
    -   _(Hint: Voir `docs/normes-codage.md`)_

## Tasks / Subtasks

-   [ ] Mettre à jour/Créer le fichier `.env` à la racine avec les variables nécessaires (ex: `COMPOSE_PROJECT_NAME`, `TZ`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT_HOST` (pour override), `SPRING_PROFILES_ACTIVE=dev`, `PUBLIC_API_BASE_URL=/api/v1`, `PUBLIC_SITE_URL=https://www.localhost`, `MY_DOMAIN=localhost`, `TRAEFIK_SUBDOMAIN=traefik`, `TRAEFIK_DASHBOARD_USER`, `TRAEFIK_DASHBOARD_HASHED_PASSWORD`). S'assurer que `.env` est dans `.gitignore`.

-   [ ] Générer des certificats auto-signés pour `localhost` (et `*.localhost`) et les placer dans `./dev-certs/`.

-   [ ] Créer le fichier de configuration dynamique pour Traefik `./traefik_dynamic_conf/dynamic_conf.yml` pour utiliser les certificats auto-signés.

-   [ ] Mettre à jour les `Dockerfile` pour `frontend` et `backend` pour :

    -   Utiliser des utilisateurs non-root.
    -   Utiliser des images de base minimales (ex: alpine, multi-stage pour Java).

-   [ ] S'assurer que des fichiers `.dockerignore` sont présents et bien configurés pour `frontend` et `backend`.

-   [ ] Créer le fichier `docker-compose.yml` à la racine :

    ```yaml
    # Pas de champ 'version' ici, Docker Compose utilise la Compose Specification.

    services:
        traefik:
            image: traefik:v3.4.0 # Vérifier la version exacte dans teck-stack.md (ex: v3.4.x ou v3.3.y)
            container_name: traefik_proxy
            command:
                - "--api.dashboard=true"
                - "--providers.docker=true"
                - "--providers.docker.exposedbydefault=false"
                - "--entrypoints.web.address=:80"
                - "--entrypoints.websecure.address=:443"
                # Configuration pour le File Provider (certificats auto-signés)
                - "--providers.file.directory=/etc/traefik/dynamic_conf" # Chemin vers la configuration dynamique
                - "--providers.file.watch=true"
            ports:
                - "80:80"
                - "443:443"
                # PAS de port 8080 exposé directement pour le dashboard ici
            volumes:
                - "/var/run/docker.sock:/var/run/docker.sock:ro" # Lecture seule est crucial
                - "./dev-certs:/etc/traefik/certs:ro" # Volume pour les certificats auto-signés
                - "./traefik_dynamic_conf:/etc/traefik/dynamic_conf:ro" # Volume pour la conf dynamique
            networks:
                - webproxy_net
            restart: unless-stopped
            labels:
                - "traefik.enable=true"
                # Routeur pour le dashboard Traefik, sécurisé
                - "traefik.http.routers.traefik-dashboard.rule=Host(`${TRAEFIK_SUBDOMAIN}.${MY_DOMAIN:-localhost}`)"
                - "traefik.http.routers.traefik-dashboard.entrypoints=websecure"
                - "traefik.http.routers.traefik-dashboard.service=api@internal"
                - "traefik.http.routers.traefik-dashboard.tls=true" # Activer TLS
                # Pas de certresolver Let's Encrypt, Traefik utilisera les certificats du file provider pour localhost
                - "traefik.http.routers.traefik-dashboard.middlewares=traefik-auth"
                - "traefik.http.middlewares.traefik-auth.basicauth.users=${TRAEFIK_DASHBOARD_USER}:${TRAEFIK_DASHBOARD_HASHED_PASSWORD}" # Définir ces vars dans .env

        db:
            image: postgres:16.8-alpine # Vérifier la version exacte dans teck-stack.md (ex: 17.x-alpine ou 16.y-alpine)
            container_name: postgres_db
            environment:
                POSTGRES_USER: ${POSTGRES_USER}
                POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
                POSTGRES_DB: ${POSTGRES_DB}
            volumes:
                - postgres_data:/var/lib/postgresql/data
            # Le port peut être exposé via docker-compose.override.yml pour un accès direct en dev
            # ports:
            #   - "${POSTGRES_PORT_HOST:-5432}:5432"
            networks:
                - internal_net
            restart: unless-stopped
            healthcheck:
                test:
                    [
                        "CMD-SHELL",
                        "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}",
                    ]
                interval: 10s
                timeout: 5s
                retries: 5
                start_period: 30s

        backend:
            build:
                context: ./backend
                dockerfile: Dockerfile # S'assurer que ce Dockerfile utilise un user non-root et une image minimale
            container_name: spring_backend_app
            environment:
                SPRING_PROFILES_ACTIVE: ${SPRING_PROFILES_ACTIVE:-dev}
                POSTGRES_USER: ${POSTGRES_USER}
                POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
                POSTGRES_DB: ${POSTGRES_DB}
                DB_HOST: db
                DB_PORT: 5432
                # Autres variables d'environnement pour le backend
            volumes:
                - ./backend/src:/app/src # Pour hot-reloading avec Spring Boot DevTools
            depends_on:
                db:
                    condition: service_healthy # Attend que la DB soit saine
            networks:
                - internal_net
                - webproxy_net
            restart: unless-stopped
            labels:
                - "traefik.enable=true"
                - "traefik.http.routers.backend-app.rule=Host(`${BACKEND_HOST:-backend}.${MY_DOMAIN:-localhost}`) || PathPrefix(`/api`)"
                - "traefik.http.routers.backend-app.entrypoints=websecure"
                - "traefik.http.routers.backend-app.service=backend-app-svc"
                - "traefik.http.services.backend-app-svc.loadbalancer.server.port=8080" # Port interne du conteneur backend
                - "traefik.http.routers.backend-app.tls=true"
            healthcheck:
                test: [
                        "CMD",
                        "curl",
                        "-f",
                        "http://localhost:8080/actuator/health",
                    ] # Adapter si Actuator est sur un autre port ou chemin
                interval: 20s
                timeout: 10s
                retries: 3
                start_period: 45s # Laisser le temps à Spring Boot de démarrer

        frontend:
            build:
                context: ./frontend
                dockerfile: Dockerfile # S'assurer que ce Dockerfile utilise un user non-root et une image minimale
            container_name: astro_frontend_app
            command: pnpm dev --host # Pour rendre accessible sur le réseau Docker et HMR
            # Le port est exposé via Traefik. Pour un accès direct en dev, utiliser docker-compose.override.yml
            # ports:
            #   - "${ASTRO_PORT:-4321}:4321"
            volumes:
                - ./frontend:/app
                - /app/node_modules # Éviter d'écraser node_modules de l'image
            environment:
                PUBLIC_API_BASE_URL: ${PUBLIC_API_BASE_URL:-/api/v1}
                PUBLIC_SITE_URL: ${PUBLIC_SITE_URL:-[https://www.localhost](https://www.localhost)} # Utiliser HTTPS avec Traefik
                # Autres variables PUBLIC_* pour Astro
            networks:
                - webproxy_net
            restart: unless-stopped
            labels:
                - "traefik.enable=true"
                - "traefik.http.routers.frontend-app.rule=Host(`${FRONTEND_HOST:-www}.${MY_DOMAIN:-localhost}`)"
                - "traefik.http.routers.frontend-app.entrypoints=websecure"
                - "traefik.http.routers.frontend-app.service=frontend-app-svc"
                - "traefik.http.services.frontend-app-svc.loadbalancer.server.port=4321" # Port du serveur de dev Astro
                - "traefik.http.routers.frontend-app.tls=true"
            healthcheck:
                test: ["CMD", "curl", "-f", "http://localhost:4321"] # Adapter si le serveur de dev Astro a un healthcheck dédié
                interval: 20s
                timeout: 10s
                retries: 3
                start_period: 30s

    volumes:
        postgres_data: # Volume nommé pour la persistance de PostgreSQL

    networks:
        webproxy_net:
            name: webproxy_network
        internal_net:
            name: internal_network
            internal: true # Renforce la sécurité
    ```

-   [ ] Créer/Mettre à jour `docker-compose.override.yml` avec des exemples concrets :

    ```yaml
    # docker-compose.override.yml (Exemples)
    services:
        frontend:
            ports:
                - "${ASTRO_PORT:-4321}:4321" # Exposition directe du port pour dev Astro HMR rapide
            # command: pnpm dev --host --debug # Exemple de surcharge de commande pour plus de logs

        backend:
            ports:
                - "8080:8080" # Exposition directe du port Spring Boot
                - "5005:5005" # Port pour le débogage Java JDWP
            environment:
                SPRING_PROFILES_ACTIVE: "dev,local-debug" # Exemple de profil de dev spécifique
                # JAVA_TOOL_OPTIONS: "-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005" # Activer le débogage à distance

        db:
            ports:
                - "${POSTGRES_PORT_HOST:-5432}:5432" # Accès direct à la base de données si nécessaire
    ```

-   [ ] (Obsolète si certificats auto-signés) La tâche concernant `acme.json` et `./letsencrypt/` n'est plus pertinente pour `localhost`. Les permissions pour `./dev-certs/` doivent permettre la lecture par le conteneur Traefik.

-   [ ] Exécuter `DOCKER_BUILDKIT=1 docker compose up --build` (ou avec les fichiers override) et vérifier que tous les services démarrent et sont sains.

-   [ ] Tester l'accès au frontend via Traefik (ex: `https://www.localhost` ou le domaine configuré avec certificat auto-signé accepté par le navigateur).

-   [ ] Tester l'accès au backend (ex: `https://backend.localhost/api/actuator/health` ou via `PathPrefix('/api')` sur le domaine frontend) via Traefik.

-   [ ] Tester le dashboard Traefik (ex: `https://traefik.localhost`) et vérifier l'invite d'authentification.

-   [ ] Ajouter une tâche pour le scan régulier des images Docker (ex: avec Trivy).

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.

-   **Docker Compose Execution:**
    -   `DOCKER_BUILDKIT=1 docker compose up --build` doit démarrer tous les services sans erreur.
    -   `docker compose ps` doit montrer tous les services en état "Up" ou "running" (et "healthy" si healthcheck configuré).
    -   `docker compose logs -f <service_name>` doit afficher les logs attendus.
-   **Service Accessibility:**
    -   Le frontend doit être accessible via Traefik sur le domaine/port configuré, en HTTPS avec un certificat auto-signé (accepté manuellement dans le navigateur pour le dev).
    -   Le backend (ex: `/actuator/health` via Traefik) doit être accessible.
    -   Le dashboard Traefik doit être accessible et sécurisé par authentification BasicAuth.
    -   La base de données doit être accessible par le backend (vérifié par le statut `service_healthy` et les logs).
-   **Hot-reloading (si configuré):**
    -   Modifier un fichier source du frontend doit déclencher un rechargement à chaud dans le navigateur.
    -   Modifier un fichier source du backend (avec Spring Boot DevTools configuré en mode `developmentOnly`) doit déclencher un redémarrage rapide de l'application.
-   **Security Checks:**
    -   Vérifier que les conteneurs `frontend` et `backend` s'exécutent avec des utilisateurs non-root (ex: `docker compose exec backend id`).
    -   Confirmer que le fichier `.env` est bien dans `.gitignore`.
    -   Recommander l'intégration d'outils de scan de vulnérabilités (ex: Trivy) dans le workflow.
-   **Tests d'Intégration Automatisés:**
    -   (Recommandé) Mettre en place des tests d'intégration qui vérifient les flux applicatifs à travers l'environnement Docker Compose.
-   **Conformité des Dockerfiles:**
    -   S'assurer que les Dockerfiles suivent les bonnes pratiques (builds multi-stages, images minimales, non-root) pour réduire l'écart avec la production.
-   _(Hint: Voir `docs/strategie-tests.md` et `docs/setup/environnement-dev.md`)_

## Story Wrap Up (Agent Populates After Execution)

-   **Agent Model Used:** `<Agent Model Name/Version>`
-   **Completion Notes:**
    -   Les versions des images (Traefik, PostgreSQL) sont des exemples et doivent être validées par rapport au fichier `teck-stack.md` au moment de l'implémentation.
    -   La configuration des certificats auto-signés pour Traefik nécessite la création des certificats et du fichier de configuration dynamique.
    -   Les Dockerfiles doivent être adaptés pour les utilisateurs non-root et les images minimales.
    -   L'utilisation de `docker compose watch` peut être explorée comme une amélioration future pour le hot-reloading.
-   **Change Log:**
    -   Révision majeure basée sur le rapport d'analyse :
        -   Suppression de `version` de Docker Compose.
        -   Mise à jour des recommandations de version pour Traefik & PostgreSQL.
        -   Remplacement de Let's Encrypt par des certificats auto-signés pour localhost.
        -   Ajout de healthchecks et `depends_on: condition: service_healthy`.
        -   Renforcement de la sécurité : utilisateurs non-root, sécurisation du dashboard Traefik, socket Docker en :ro confirmé, `.env` dans `.gitignore`.
        -   Recommandations pour BuildKit, images minimales, scans de vulnérabilités, `.dockerignore`.
        -   Clarification pour `docker-compose.override.yml` avec exemples.
        -   Enrichissement des exigences de test.
        -   Clarification de l'exposition des ports.
    -   Initial Draft

---

J'ai quelques points qui nécessitent des éclaircissements pour finaliser au mieux :

1.  **Dépendance Spring Boot DevTools :** Le rapport souligne l'importance que `spring-boot-devtools` soit configuré comme une dépendance optionnelle (ex: `<optional>true</optional>` en Maven ou `developmentOnly` en Gradle) pour éviter son inclusion dans les builds de production. Pouvez-vous confirmer que c'est bien le cas dans le projet backend ou que cette vérification sera faite ?
2.  **Exposition des Ports du Frontend :** La story initiale et la version révisée (via l'override) permettent une double exposition du port du service frontend : une fois directement (ex: sur `localhost:4321`) et une fois via Traefik (ex: `https://www.localhost`). Cette double exposition est-elle intentionnelle (par exemple, l'accès direct pour un développement frontend plus rapide avec HMR, et l'accès via Traefik pour des tests d'intégration complets avec HTTPS) ? Ou préférez-vous que l'accès se fasse exclusivement via Traefik, en supprimant la possibilité d'exposition directe même dans l'override ?

Votre retour sur ces points permettra d'affiner encore la story si nécessaire.
