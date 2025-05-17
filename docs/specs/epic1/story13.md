# Story 1.13: Docker Compose Base pour Dev Local

**Status:** Draft

## Goal & Context

**User Story:** En tant que Développeur (Dev), je veux créer un fichier `docker-compose.yml` de base pour orchestrer les services (frontend, backend, db, traefik) en dev local afin de faciliter le lancement et la gestion de l'environnement de développement local complet.

**Context:** Cette story est la dernière de l'Epic 1 et rassemble tous les composants d'infrastructure précédents (VPS setup, Docker, Traefik, PostgreSQL, Frontend Astro, Backend Spring Boot). Elle permet aux développeurs de lancer l'ensemble de l'application avec une seule commande pour un développement et des tests locaux efficaces.

## Detailed Requirements

Créer un fichier `docker-compose.yml` à la racine du projet. Ce fichier définira les services pour le frontend, le backend, la base de données (`db`), et `traefik`. Il devra gérer les builds des images Docker pour le frontend et le backend (en utilisant leurs Dockerfiles respectifs), configurer les réseaux pour la communication inter-services, monter les volumes nécessaires (persistance DB, configuration Traefik, code source pour le hot-reloading), charger les variables d'environnement depuis un fichier `.env`, et exposer les ports nécessaires pour le développement local. Un fichier `docker-compose.override.yml` pourra être utilisé pour les surcharges spécifiques au développement.

## Acceptance Criteria (ACs)

- AC1: Un fichier `docker-compose.yml` est créé à la racine du projet.
- AC2: Le fichier définit les services suivants :
  - `frontend`: Build à partir de `frontend/Dockerfile`, monte le code source pour le hot-reloading, expose le port du serveur de dev Astro (ex: 4321).
  - `backend`: Build à partir de `backend/Dockerfile`, monte le code source pour le hot-reloading (si configuré pour Spring Boot DevTools), expose le port de l'application Spring Boot (ex: 8080). Dépend de `db`.
  - `db`: Utilise l'image PostgreSQL, configure les variables d'environnement (`POSTGRES_USER`, etc.), monte un volume pour la persistance des données.
  - `traefik`: Utilise l'image Traefik, monte sa configuration statique et le fichier `acme.json`, monte le socket Docker, expose les ports 80/443. Dépend de `frontend` et `backend` pour la configuration des routes.
- AC3: Des réseaux Docker sont définis et utilisés pour permettre la communication entre Traefik et les services applicatifs, et entre le backend et la base de données.
- AC4: Les variables d'environnement sont chargées à partir d'un fichier `.env` à la racine du projet.
- AC5: Les ports des services sont correctement mappés à l'hôte pour l'accès local (ex: Traefik 80/443, Astro dev server 4321, Spring Boot 8080/8081).
- AC6: La commande `docker compose up` (ou `docker compose -f docker-compose.yml -f docker-compose.override.yml up` si un override est utilisé) démarre tous les services avec succès.
- AC7: (Optionnel mais recommandé) Un fichier `docker-compose.override.yml` est créé pour les configurations spécifiques au développement local (ex: ports différents, activation de Spring Boot DevTools pour le hot-reloading backend).

## Technical Implementation Context

**Guidance:** Écrire le `docker-compose.yml` en s'assurant que chaque service est correctement configuré pour le développement.

- **Relevant Files:**

  - Files to Create/Modify:
    - `docker-compose.yml` (à la racine)
    - `docker-compose.override.yml` (optionnel, à la racine)
    - `.env` (s'assurer qu'il contient toutes les variables nécessaires pour les services)
  - _(Hint: Se référer à `docs/project-structure.md`, `docs/setup/environnement-dev.md` (à créer), et aux Dockerfiles des Story 1.9 et 1.12. Les configurations de Traefik (Story 1.3) et PostgreSQL (Story 1.4) seront intégrées ici.)_

- **Key Technologies:**

  - Docker Compose
  - Docker
  - Traefik, PostgreSQL, Astro, Spring Boot (en tant que services)
  - _(Hint: Voir `docs/teck-stack.md`)_

- **API Interactions / SDK Usage:**

  - Les services interagissent via les réseaux Docker configurés.

- **UI/UX Notes:**

  - Permet au développeur d'accéder facilement au frontend et potentiellement aux dashboards (Traefik, Actuator).

- **Data Structures:**

  - Gère les volumes pour la persistance des données de la DB et de Traefik.

- **Environment Variables:**

  - Toutes les variables listées dans `docs/environnement-vars.md` pertinentes pour le dev local doivent être dans `.env` et référencées dans `docker-compose.yml`.
  - _(Hint: Voir `docs/environnement-vars.md`)_

- **Coding Standards Notes:**
  - Le `docker-compose.yml` doit être clair, bien commenté et utiliser les meilleures pratiques Docker Compose.
  - _(Hint: Voir `docs/normes-codage.md`)_

## Tasks / Subtasks

- [ ] Créer/Mettre à jour le fichier `.env` à la racine avec toutes les variables nécessaires (ex: `COMPOSE_PROJECT_NAME`, `TZ`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT_HOST`, `SPRING_PROFILES_ACTIVE=dev`, `PUBLIC_API_BASE_URL=/api/v1`, `PUBLIC_SITE_URL=http://localhost:4321`, `LETSENCRYPT_EMAIL`, `MY_DOMAIN=localhost` ou un domaine de test local, `TRAEFIK_SUBDOMAIN=traefik`).
- [ ] Créer le fichier `docker-compose.yml` à la racine :

  ```yaml
  version: "3.8"

  services:
    traefik:
      image: traefik:v3.0 # Utiliser la version de teck-stack.md (ex: v3.4)
      container_name: traefik_proxy
      command:
        - "--api.dashboard=true" # Activer le dashboard pour dev
        # - "--api.insecure=true" # Pour dev local sans auth, OU configurer Basic Auth
        - "--providers.docker=true"
        - "--providers.docker.exposedbydefault=false"
        - "--entrypoints.web.address=:80"
        - "--entrypoints.websecure.address=:443"
        - "--certificatesresolvers.letsencrypt.acme.email=${LETSENCRYPT_EMAIL}"
        - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
        - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
        # Pour dev local avec self-signed certs si Let's Encrypt n'est pas voulu/possible pour localhost:
        # - "--providers.file.filename=/dynamic_conf.yml"
        # - "--providers.file.watch=true"
      ports:
        - "80:80"
        - "443:443"
        - "8080:8080" # Port pour le dashboard Traefik (si --api.insecure=true ou si auth est gérée autrement)
      volumes:
        - "/var/run/docker.sock:/var/run/docker.sock:ro"
        - "./letsencrypt:/letsencrypt" # Persistance certificats
        # - "./config/dynamic_conf.yml:/dynamic_conf.yml:ro" # Pour conf dynamique locale si besoin
      networks:
        - webproxy_net
      restart: unless-stopped
      labels: # Sécurisation du dashboard Traefik lui-même via Traefik
        - "traefik.enable=true"
        - "traefik.http.routers.traefik-dashboard.rule=Host(`${TRAEFIK_SUBDOMAIN}.${MY_DOMAIN:-localhost}`)" # Adapter le domaine
        - "traefik.http.routers.traefik-dashboard.entrypoints=websecure"
        - "traefik.http.routers.traefik-dashboard.service=api@internal"
        - "traefik.http.routers.traefik-dashboard.tls.certresolver=letsencrypt" # Ou commenter pour self-signed
        # Ajouter un middleware d'authentification pour le dashboard ici si nécessaire (voir docs Traefik BasicAuth)

    db:
      image: postgres:16.3-alpine # Utiliser la version de teck-stack.md (ex: 16.9)
      container_name: postgres_db
      environment:
        POSTGRES_USER: ${POSTGRES_USER}
        POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
        POSTGRES_DB: ${POSTGRES_DB}
      volumes:
        - postgres_data:/var/lib/postgresql/data
      ports: # Optionnel: exposer pour accès direct en dev
        - "${POSTGRES_PORT_HOST:-5432}:5432"
      networks:
        - internal_net
      restart: unless-stopped

    backend:
      build:
        context: ./backend
        dockerfile: Dockerfile
      container_name: spring_backend_app
      environment:
        SPRING_PROFILES_ACTIVE: ${SPRING_PROFILES_ACTIVE:-dev}
        POSTGRES_USER: ${POSTGRES_USER}
        POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
        POSTGRES_DB: ${POSTGRES_DB}
        DB_HOST: db # Nom du service de la base de données
        DB_PORT: 5432
        # Autres variables d'environnement pour le backend
      volumes: # Pour le hot-reloading avec Spring Boot DevTools (si configuré dans le projet Maven)
        - ./backend/src:/app/src # Mapper le code source
      depends_on:
        - db
      networks:
        - internal_net
        - webproxy_net # Si Traefik doit router vers lui
      restart: unless-stopped
      labels: # Labels pour Traefik
        - "traefik.enable=true"
        - "traefik.http.routers.backend-app.rule=Host(`${BACKEND_HOST:-backend}.${TRAEFIK_DOMAIN_MAIN:-localhost}`) || PathPrefix(`/api`)" # Adapter règle
        - "traefik.http.routers.backend-app.entrypoints=websecure"
        - "traefik.http.routers.backend-app.service=backend-app-svc"
        - "traefik.http.services.backend-app-svc.loadbalancer.server.port=8080" # Port interne du conteneur backend
        - "traefik.http.routers.backend-app.tls.certresolver=letsencrypt" # Ou commenter pour self-signed

    frontend:
      build:
        context: ./frontend
        dockerfile: Dockerfile
        # Passer des ARGs si le Dockerfile frontend les attend pour les PUBLIC_ env vars
        # args:
        #   PUBLIC_API_BASE_URL: ${PUBLIC_API_BASE_URL}
      container_name: astro_frontend_app
      # Pour le mode dev d'Astro, on expose directement le port et on monte les sources
      # Pour servir les fichiers buildés (comme le Dockerfile le fait), on utiliserait les labels Traefik
      # et on ne builderait pas ici mais on utiliserait une image pré-buildée ou on laisserait le Dockerfile faire.
      # Solution pour le dev local avec hot-reloading Astro :
      command: pnpm dev --host # Rendre accessible sur le réseau Docker
      ports:
        - "${ASTRO_PORT:-4321}:4321" # Port du serveur de dev Astro
      volumes:
        - ./frontend:/app # Monter tout le répertoire frontend
        - /app/node_modules # Éviter d'écraser node_modules de l'image
      environment:
        PUBLIC_API_BASE_URL: ${PUBLIC_API_BASE_URL:-/api/v1} # Assurer que le frontend peut appeler le backend via Traefik
        PUBLIC_SITE_URL: ${PUBLIC_SITE_URL:-http://localhost:4321}
        # Autres variables PUBLIC_* pour Astro
      networks:
        - webproxy_net
      restart: unless-stopped
      labels: # Labels pour Traefik (si on veut servir le dev server via Traefik, ou pour le mode prod)
        - "traefik.enable=true"
        - "traefik.http.routers.frontend-app.rule=Host(`${FRONTEND_HOST:-www}.${MY_DOMAIN:-localhost}`)" # Adapter règle
        - "traefik.http.routers.frontend-app.entrypoints=websecure"
        - "traefik.http.routers.frontend-app.service=frontend-app-svc"
        - "traefik.http.services.frontend-app-svc.loadbalancer.server.port=4321" # Port du serveur de dev Astro
        - "traefik.http.routers.frontend-app.tls.certresolver=letsencrypt" # Ou commenter pour self-signed

  volumes:
    postgres_data: # Volume nommé pour la persistance de PostgreSQL
    # traefik_acme: # Si on préfère un volume nommé pour acme.json

  networks:
    webproxy_net: # Réseau externe pour Traefik et les services exposés
      name: webproxy_network
    internal_net: # Réseau interne pour la communication backend-db
      name: internal_network
      internal: true # Optionnel, pour plus de sécurité
  ```

- [ ] (Optionnel) Créer `docker-compose.override.yml` pour surcharges spécifiques au dev (ex: ports différents, activation de debuggers, etc.).
- [ ] S'assurer que le répertoire `./letsencrypt/` pour la persistance des certificats Let's Encrypt est créé et que `acme.json` a les permissions 600.
- [ ] Exécuter `docker compose up --build` (ou `docker compose -f ... -f ... up --build`) et vérifier que tous les services démarrent.
- [ ] Tester l'accès au frontend via Traefik (ex: `https://www.localhost` ou le domaine configuré) et au backend (ex: `/api/actuator/health` via Traefik).
- [ ] Tester le dashboard Traefik (ex: `https://${TRAEFIK_SUBDOMAIN}.localhost`).

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.

- **Docker Compose Execution:**
  - `docker compose up --build` doit démarrer tous les services sans erreur.
  - `docker compose ps` doit montrer tous les services en état "Up" ou "running".
  - `docker compose logs -f <service_name>` doit afficher les logs attendus.
- **Service Accessibility:**
  - Le frontend doit être accessible via Traefik sur le domaine/port configuré, en HTTPS avec un certificat valide (Let's Encrypt ou self-signed pour localhost).
  - Le backend (ex: `/actuator/health`) doit être accessible via Traefik.
  - Le dashboard Traefik doit être accessible et sécurisé.
  - La base de données doit être accessible par le backend (vérifié par les logs du backend ou l'état de santé de la DB).
- **Hot-reloading (si configuré):**
  - Modifier un fichier source du frontend doit déclencher un rechargement à chaud dans le navigateur.
  - Modifier un fichier source du backend (avec Spring Boot DevTools) doit déclencher un redémarrage rapide de l'application.
- _(Hint: Voir `docs/strategie-tests.md` et `docs/setup/environnement-dev.md`)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
- **Change Log:**
  - Initial Draft
