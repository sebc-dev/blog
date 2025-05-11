# Story 1.9: Dockerfile pour Frontend Astro (Build & Serve Nginx)

**Status:** Draft

## Goal & Context

**User Story:** En tant que Développeur (Dev), je veux préparer un `Dockerfile` pour l'application frontend Astro qui build le site statique et le sert via Nginx afin de pouvoir conteneuriser l'application frontend pour le déploiement.

**Context:** Cette story est essentielle pour le déploiement conteneurisé du frontend (Epic 1). Elle s'appuie sur le projet Astro initialisé (Story 1.6) et prépare l'artefact qui sera déployé via Docker Compose.

## Detailed Requirements

Créer un `frontend/Dockerfile` multi-stage. Le premier stage ("builder") utilisera PNPM pour installer les dépendances et builder l'application Astro (`pnpm build`). Le second stage ("runner") utilisera une image Nginx (ou Caddy, mais Nginx est spécifié dans l'Epic) pour servir les fichiers statiques générés par le stage de build. Nginx doit être configuré pour s'exécuter en tant qu'utilisateur non-root.

## Acceptance Criteria (ACs)

- AC1: Un fichier `frontend/Dockerfile` est créé.
- AC2: Le Dockerfile utilise une approche multi-stage :
    - Un stage "builder" basé sur une image Node.js (correspondant à la version LTS de `docs/teck-stack.md`, ex: Node 22) qui installe PNPM, copie les fichiers sources du frontend, installe les dépendances (`pnpm install`), et exécute le build Astro (`pnpm build`).
    - Un stage "runner" basé sur une image Nginx (ex: `nginx:alpine` ou version stable).
- AC3: Le stage "runner" copie les fichiers statiques générés (`frontend/dist/`) du stage "builder" dans le répertoire de service de Nginx (ex: `/usr/share/nginx/html`).
- AC4: Une configuration Nginx de base est fournie (ou le comportement par défaut de Nginx est suffisant) pour servir correctement le site statique (gérer les requêtes vers `index.html`, les assets, et potentiellement le fallback pour les routes SPA si Astro est configuré pour cela, bien que pour un blog statique, ce soit moins courant).
- AC5: Nginx dans le stage "runner" est configuré pour s'exécuter en tant qu'utilisateur non-root (ex: utilisateur `nginx`).
- AC6: L'image Docker peut être buildée avec succès (`docker build -t astro-frontend-test ./frontend`).
- AC7: Un conteneur lancé à partir de l'image buildée sert correctement la page d'accueil Astro de base sur le port exposé (ex: port 80 du conteneur).

## Technical Implementation Context

**Guidance:** Écrire le `Dockerfile` et un fichier de configuration Nginx minimal si nécessaire.

- **Relevant Files:**
  - Files to Create:
    - `frontend/Dockerfile`
    - `frontend/nginx.conf` (optionnel, si la configuration Nginx par défaut doit être surchargée)
  - _(Hint: Voir `docs/project-structure.md` et `docs/operations/runbook.md` pour les aspects de déploiement)_

- **Key Technologies:**
  - Docker
  - Astro (pour le build)
  - PNPM
  - Nginx
  - Node.js (pour le stage de build)
  - _(Hint: Voir `docs/teck-stack.md`)_

- **API Interactions / SDK Usage:**
  - Non applicable pour cette story.

- **UI/UX Notes:**
  - Non applicable pour cette story, concerne l'infrastructure de service.

- **Data Structures:**
  - Non applicable pour cette story.

- **Environment Variables:**
  - Les variables d'environnement `PUBLIC_*` d'Astro doivent être disponibles au moment du build si elles affectent la génération des fichiers statiques. Le Dockerfile doit potentiellement les accepter comme `ARG` et les passer au build Astro. Pour cette story initiale, on peut supposer qu'elles sont gérées via le CI/CD ou des valeurs par défaut.
  - _(Hint: Voir `docs/environnement-vars.md`)_

- **Coding Standards Notes:**
  - Le Dockerfile doit être optimisé pour la taille de l'image et le temps de build (utilisation du cache Docker, ordre des commandes `COPY` et `RUN`).
  - Suivre les bonnes pratiques de sécurité pour les Dockerfiles (utilisateur non-root).
  - _(Hint: Voir `docs/normes-codage.md`)_

## Tasks / Subtasks

- [ ] Créer le fichier `frontend/Dockerfile` :
    ```dockerfile
    # Stage 1: Builder
    FROM node:22-alpine AS builder
    # Installer PNPM
    RUN npm install -g pnpm

    WORKDIR /app

    # Copier les fichiers de manifeste et de lock
    COPY package.json pnpm-lock.yaml ./
    # Installer uniquement les dépendances de production/dev nécessaires au build
    RUN pnpm install --frozen-lockfile

    # Copier le reste des fichiers sources de l'application
    COPY . .

    # Builder l'application Astro
    # Passer les PUBLIC_* env vars si nécessaire via ARG au moment du build Docker
    # Exemple: ARG PUBLIC_API_BASE_URL
    # ENV PUBLIC_API_BASE_URL=$PUBLIC_API_BASE_URL
    RUN pnpm build

    # Stage 2: Runner (Nginx)
    FROM nginx:1.27-alpine-slim # Utiliser une version alpine slim pour une image légère

    # Enlever la configuration Nginx par défaut
    RUN rm /etc/nginx/conf.d/default.conf

    # (Optionnel) Copier une configuration Nginx personnalisée si nécessaire
    # COPY nginx.conf /etc/nginx/conf.d/default.conf
    # Si nginx.conf n'est pas fourni, Nginx servira depuis /usr/share/nginx/html par défaut.
    # Une configuration de base pour un SPA Astro (si client-side routing est utilisé) pourrait être:
    # server {
    #   listen 80;
    #   server_name localhost;
    #   root /usr/share/nginx/html;
    #   index index.html;
    #   location / {
    #     try_files $uri $uri/ /index.html;
    #   }
    # }
    # Pour un blog statique, le comportement par défaut est souvent suffisant.

    # Copier les fichiers buildés depuis le stage builder
    COPY --from=builder /app/dist /usr/share/nginx/html

    # S'assurer que Nginx s'exécute en tant qu'utilisateur non-root 'nginx'
    # L'image nginx:alpine s'exécute déjà en tant qu'utilisateur nginx par défaut.
    # Vérifier les permissions sur /usr/share/nginx/html si nécessaire.
    # RUN chown -R nginx:nginx /usr/share/nginx/html && chmod -R 755 /usr/share/nginx/html

    EXPOSE 80

    # Commande par défaut pour démarrer Nginx
    CMD ["nginx", "-g", "daemon off;"]
    ```
- [ ] (Optionnel) Créer un fichier `frontend/nginx.conf` si une configuration Nginx spécifique est requise au-delà du service de fichiers statiques simple. Pour un blog Astro typiquement statique, la configuration par défaut de Nginx pour servir des fichiers depuis `/usr/share/nginx/html` est souvent suffisante.
- [ ] Ajouter `.dockerignore` dans `frontend/` pour exclure `node_modules`, `.git`, etc., du contexte de build Docker envoyé au démon.
    ```
    node_modules
    .git
    .DS_Store
    pnpm-debug.log
    dist # Si on ne veut pas le copier si déjà buildé localement, le Dockerfile le génère
    ```
- [ ] Builder l'image Docker localement pour tester : `docker build -t astro-frontend-test ./frontend`.
- [ ] Lancer un conteneur à partir de l'image buildée : `docker run -d -p 8080:80 astro-frontend-test`.
- [ ] Accéder à `http://localhost:8080` dans un navigateur et vérifier que la page d'accueil Astro s'affiche correctement.
- [ ] Vérifier que le serveur Nginx s'exécute en tant qu'utilisateur `nginx` (ex: `docker exec <container_id> ps aux | grep nginx`).

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.
- **Docker Build & Run:**
  - Le build Docker (`docker build ...`) doit se terminer avec succès.
  - Le conteneur Docker doit démarrer sans erreur (`docker run ...`).
  - Le site doit être accessible via le port mappé (ex: `http://localhost:8080`).
- **Manual/Visual Verification:**
  - La page d'accueil Astro s'affiche correctement lorsqu'elle est servie par le conteneur Nginx.
  - Vérifier (via les outils de développement du navigateur ou `docker exec`) que Nginx s'exécute en tant qu'utilisateur non-root.
- _(Hint: Voir `docs/strategie-tests.md` pour l'approche globale)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
- **Change Log:**
  - Initial Draft