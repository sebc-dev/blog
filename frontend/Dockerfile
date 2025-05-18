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