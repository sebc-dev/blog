# Story 1.9: Dockerfile pour Frontend Astro (Build & Serve Nginx)

**Statut:** Révisé

## Goal & Context

**User Story:** En tant que Développeur (Dev), je veux préparer un `Dockerfile` pour l'application frontend Astro qui build le site statique et le sert via Nginx afin de pouvoir conteneuriser l'application frontend pour le déploiement.

**Context:** Cette story est essentielle pour le déploiement conteneurisé du frontend (Epic 1). Elle s'appuie sur le projet Astro initialisé (Story 1.6) et prépare l'artefact qui sera déployé via Docker Compose. Le rapport de validation de mai 2025 a été consulté pour actualiser les versions et les bonnes pratiques.

## Detailed Requirements

Créer un `frontend/Dockerfile` multi-stage. Le premier stage ("builder") utilisera une image Node.js LTS (actuellement 22.x) et PNPM (géré via Corepack) pour installer les dépendances et builder l'application Astro (`pnpm build`). Le second stage ("runner") utilisera une image Nginx stable et minimale (actuellement 1.28.x) pour servir les fichiers statiques générés par le stage de build. Nginx doit être configuré pour s'exécuter avec ses processus workers en tant qu'utilisateur non-root. Les optimisations de cache Docker (via BuildKit) doivent être utilisées.

## Acceptance Criteria (ACs)

-   AC1: Un fichier `frontend/Dockerfile` est créé.
-   AC2: Le Dockerfile utilise une approche multi-stage :
    -   Un stage "builder" basé sur une image Node.js (par exemple, `node:22.15.1-slim` ou la version LTS la plus récente de la branche 22.x) qui installe Corepack, puis PNPM, copie les fichiers sources du frontend, installe les dépendances (`pnpm install` avec optimisation du cache via `--mount=type=cache`), et exécute le build Astro (`pnpm build`).
    -   Un stage "runner" basé sur une image Nginx (par exemple, `nginx:1.28.0-alpine-slim` ou la version stable la plus récente de la branche 1.28.x).
-   AC3: Le stage "runner" copie les fichiers statiques générés (`frontend/dist/`) du stage "builder" dans le répertoire de service de Nginx (par exemple, `/usr/share/nginx/html`), en s'assurant des bonnes permissions si nécessaire (par exemple, via `COPY --chown=nginx:nginx`).
-   AC4: Une configuration Nginx de base est fournie (via un fichier copié dans `/etc/nginx/conf.d/`) pour servir correctement le site statique. Cette configuration doit être alignée avec la structure de sortie d'Astro (gestion de `try_files`). Pour un blog statique, une configuration simple est souvent suffisante, mais les optimisations (gzip, cache client) et la sécurité (headers) doivent être considérées.
-   AC5: Nginx dans le stage "runner" s'exécute avec ses processus workers en tant qu'utilisateur non-root (par exemple, utilisateur `nginx`), ce qui est le comportement par défaut des images Nginx officielles.
-   AC6: L'image Docker peut être buildée avec succès (`docker build -t astro-frontend-test ./frontend`) en utilisant BuildKit.
-   AC7: Un conteneur lancé à partir de l'image buildée sert correctement la page d'accueil Astro de base sur le port exposé (par exemple, port 80 du conteneur).

## Technical Implementation Context

**Guidance:** Écrire le `Dockerfile` et un fichier de configuration Nginx minimal si nécessaire, en s'inspirant des bonnes pratiques du rapport de mai 2025.

-   **Relevant Files:**

    -   Files to Create:
        -   `frontend/Dockerfile`
        -   `frontend/my-astro-app.conf` (ou nom similaire, pour la configuration Nginx, à copier dans `/etc/nginx/conf.d/`)
        -   `frontend/.dockerignore`
    -   _(Hint: Voir `docs/project-structure.md` et `docs/operations/runbook.md` pour les aspects de déploiement)_

-   **Key Technologies:**

    -   Docker (avec BuildKit)
    -   Astro (pour le build)
    -   PNPM (géré via Corepack)
    -   Nginx (version stable 1.28.x recommandée)
    -   Node.js (version LTS 22.x recommandée pour le build)
    -   _(Hint: Voir `docs/teck-stack.md`)_

-   **API Interactions / SDK Usage:**

    -   Non applicable pour cette story.

-   **UI/UX Notes:**

    -   Non applicable pour cette story, concerne l'infrastructure de service.

-   **Data Structures:**

    -   Non applicable pour cette story.

-   **Environment Variables:**

    -   Les variables d'environnement `PUBLIC_*` d'Astro doivent être disponibles au moment du build si elles affectent la génération des fichiers statiques. Le Dockerfile doit potentiellement les accepter comme `ARG` et les passer au build Astro. Pour cette story initiale, on peut supposer qu'elles sont gérées via le CI/CD ou des valeurs par défaut.
    -   _(Hint: Voir `docs/environnement-vars.md`)_

-   **Coding Standards Notes:**
    -   Le Dockerfile doit être optimisé pour la taille de l'image et le temps de build (utilisation du cache Docker avec BuildKit, ordre des commandes `COPY` et `RUN`).
    -   Suivre les bonnes pratiques de sécurité pour les Dockerfiles (processus Nginx worker non-root, versions d'images épinglées, minimisation de la surface d'attaque).
    -   _(Hint: Voir `docs/normes-codage.md` et le rapport de validation de mai 2025)_

## Tasks / Subtasks

-   [ ] Créer le fichier `frontend/Dockerfile` (basé sur le rapport de mai 2025) :

    ```dockerfile
    # Stage 1: Builder
    # Utiliser une version LTS spécifique de Node.js (branche 22.x), variante slim recommandée
    FROM node:22.15.1-slim AS builder

    WORKDIR /app

    # Installer et configurer Corepack pour gérer PNPM
    # Mettre à jour Corepack vers la dernière version ou une version stable connue
    RUN npm install -g corepack@latest
    RUN corepack enable
    # Préparer une version spécifique de pnpm (ex: pnpm@9.x.x)
    # Le rapport mentionne pnpm@9.15.4 comme exemple suite à des problèmes de signature avec corepack.
    # Il est important de vérifier la version actuelle et stable de pnpm au moment de l'implémentation.
    RUN corepack prepare pnpm@10.7.1 --activate

    # Copier les fichiers de manifeste et de lock en premier pour optimiser le cache Docker
    COPY package.json pnpm-lock.yaml ./

    # Installer les dépendances en utilisant le cache de build pnpm via BuildKit
    # Le chemin target pour le cache pnpm peut être /root/.local/share/pnpm/store ou /root/.pnpm/store.
    # Consulter la documentation pnpm et les exemples pour le chemin exact avec l'image de base Node choisie.
    # Le rapport utilise /root/.pnpm/store (section 3.1) et /pnpm/store (section 3.3).
    # Pour les images node officielles, /root/.local/share/pnpm/store est souvent utilisé.
    # Vérifier le chemin correct avec `pnpm store path` dans un conteneur de test.
    RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile

    # Copier le reste des fichiers sources de l'application
    COPY . .

    # Builder l'application Astro
    # Passer les PUBLIC_* env vars si nécessaire via ARG au moment du build Docker
    # Exemple: ARG PUBLIC_API_BASE_URL
    # ENV PUBLIC_API_BASE_URL=$PUBLIC_API_BASE_URL
    RUN pnpm build

    # Stage 2: Runner (Nginx)
    # Utiliser une version Nginx stable et minimale (branche 1.28.x), variante alpine-slim recommandée
    FROM nginx:1.28.0-alpine-slim

    # (Optionnel mais recommandé) Créer un utilisateur et groupe non-root si ce n'est pas déjà géré par l'image de base
    # L'image nginx officielle configure déjà un utilisateur 'nginx'. Les workers s'exécutent sous cet utilisateur.

    # Enlever la configuration Nginx par défaut si on la remplace entièrement par la nôtre.
    # RUN rm /etc/nginx/conf.d/default.conf
    # Il est souvent mieux de juste ajouter une config spécifique et de laisser le reste si besoin.
    # Le rapport (section 4.5) recommande de copier dans /etc/nginx/conf.d/default.conf (écrasement)
    # ou /etc/nginx/conf.d/my-astro-app.conf. L'écrasement de default.conf est plus simple pour un seul site.

    # Copier une configuration Nginx personnalisée pour l'application Astro
    # Cette configuration devrait gérer le service des fichiers statiques, try_files, etc.
    COPY my-astro-app.conf /etc/nginx/conf.d/default.conf

    # Copier les fichiers buildés depuis le stage builder vers le répertoire de service de Nginx
    # S'assurer des bonnes permissions pour l'utilisateur nginx
    COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

    # Exposer le port sur lequel Nginx écoutera (généralement 80)
    EXPOSE 80

    # Commande par défaut pour démarrer Nginx au premier plan
    CMD ["nginx", "-g", "daemon off;"]
    ```

-   [ ] Créer un fichier `frontend/my-astro-app.conf` avec une configuration Nginx de base (adaptée du rapport si nécessaire) :

    ```nginx
    server {
        listen 80;
        server_name localhost; # Ajuster si nécessaire pour d'autres environnements

        root /usr/share/nginx/html;
        index index.html index.htm;

        # Configuration pour servir un site Astro statique (non-SPA par défaut)
        # Adapter try_files en fonction de la configuration de build d'Astro (trailingSlash, build.format)
        # Le rapport (section 4.1) suggère: try_files $uri $uri/ /index.html =404;
        # Cela doit être validé avec la sortie réelle d'Astro.
        location / {
            try_files $uri $uri/ /index.html =404;
        }

        # Optimisations de base (considérer d'autres directives du rapport: gzip, expires, security headers)
        # Rapport section 4.2 & Tableau 3
        sendfile on;
        tcp_nopush on;
        tcp_nodelay on;

        # Activer Gzip (recommandé par le rapport, section 4.2)
        gzip on;
        gzip_vary on;
        gzip_proxied any;
        gzip_comp_level 6;
        gzip_types text/plain text/css application/json application/javascript application/x-javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
        gzip_min_length 1024; # Rapport section 4.2

        # En-têtes de cache pour les assets statiques (rapport section 4.3)
        location ~* \.(?:css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2)$ {
            expires 365d;
            add_header Cache-Control "public, immutable";
            access_log off; # Optionnel
        }

        # Minimal logging (stdout/stderr par défaut pour Docker, mais peut être explicite)
        access_log /var/log/nginx/access.log;
        error_log /var/log/nginx/error.log;

        # Pour masquer la version de Nginx (rapport section 4.4)
        server_tokens off;

        # Considérer d'ajouter des en-têtes de sécurité (HSTS, CSP, etc.) ici,
        # en se basant sur le rapport section 4.4 et Tableau 4.
        # add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
        # add_header X-Content-Type-Options "nosniff" always;
        # add_header X-Frame-Options "SAMEORIGIN" always;
        # add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        # add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; object-src 'none'; frame-ancestors 'none';" always; # À ADAPTER !
        # add_header Permissions-Policy "geolocation=(), midi=(), camera=(), usb=(), magnetometer=(), accelerometer=(), gyroscope=(), microphone=()" always;
    }
    ```

-   [ ] Ajouter un fichier `.dockerignore` complet dans `frontend/` (basé sur le rapport section 3.4) :

    ```
    # Fichiers et dossiers générés par Node/PNPM
    node_modules
    pnpm-debug.log
    dist
    .astro

    # Fichiers de configuration locale et sensibles
    .env
    .env.*
    *.local

    # Cache et logs de développement
    .cache
    logs
    *.log
    npm-debug.log*
    yarn-debug.log*
    yarn-error.log*

    # Répertoires et fichiers de gestion de version
    .git
    .gitignore
    .gitattributes

    # Fichiers spécifiques au système d'exploitation
    .DS_Store
    Thumbs.db

    # Fichiers de configuration Docker (non nécessaires dans le contexte de build pour être copiés)
    # Dockerfile # Exclure pour éviter de le copier dans l'image si COPY . . est utilisé imprudemment
    # .dockerignore # Idem

    # Documentation et autres fichiers non nécessaires à l'image de runtime
    README.md
    # docs/ # Exclure si non nécessaire au build

    # Fichiers de test locaux, rapports de couverture, etc.
    coverage/
    test-results/
    ```

-   [ ] Builder l'image Docker localement pour tester : `DOCKER_BUILDKIT=1 docker build -t astro-frontend-test ./frontend`.
-   [ ] Lancer un conteneur à partir de l'image buildée : `docker run -d -p 8080:80 --name astro-app astro-frontend-test`.
-   [ ] Accéder à `http://localhost:8080` dans un navigateur et vérifier que la page d'accueil Astro s'affiche correctement.
-   [ ] Vérifier que les processus workers Nginx s'exécutent en tant qu'utilisateur `nginx` (par exemple, `docker exec astro-app ps aux | grep nginx`).
-   [ ] Consulter les logs du conteneur pour des erreurs Nginx : `docker logs astro-app`.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.

-   **Docker Build & Run:**
    -   Le build Docker (`DOCKER_BUILDKIT=1 docker build ...`) doit se terminer avec succès.
    -   Le conteneur Docker doit démarrer sans erreur (`docker run ...`).
    -   Le site doit être accessible via le port mappé (par exemple, `http://localhost:8080`).
-   **Manual/Visual Verification:**
    -   La page d'accueil Astro s'affiche correctement lorsqu'elle est servie par le conteneur Nginx.
    -   Vérifier (via `docker exec <container_id> ps aux | grep nginx`) que les processus Nginx workers s'exécutent en tant qu'utilisateur non-root (par exemple, `nginx`).
-   _(Hint: Voir `docs/strategie-tests.md` pour l'approche globale)_

## Story Wrap Up (Agent Populates After Execution)

-   **Agent Model Used:** `<Agent Model Name/Version>`
-   **Completion Notes:** {Story mise à jour en fonction du rapport "Validation et Actualisation d'un Dockerfile pour Astro Statique avec Nginx (Mai 2025)". Les versions de Node.js (22.15.1-slim) et Nginx (1.28.0-alpine-slim) ont été actualisées. La gestion de PNPM via Corepack (avec pnpm@9.15.4 spécifié) a été précisée pour pallier les problèmes de signature. Les optimisations de cache Docker avec BuildKit (`--mount=type=cache`) ont été intégrées pour `pnpm install`. Le fichier `.dockerignore` a été complété. La configuration Nginx (`my-astro-app.conf`) inclut des directives de base pour la performance (sendfile, gzip, cache client) et la sécurité (server_tokens off), avec des commentaires pour l'ajout d'autres en-têtes de sécurité. La copie des fichiers buildés vers Nginx utilise `--chown=nginx:nginx`.}
-   **Change Log:**
    -   Révision basée sur le rapport "Validation et Actualisation d'un Dockerfile pour Astro Statique avec Nginx (Mai 2025)".
