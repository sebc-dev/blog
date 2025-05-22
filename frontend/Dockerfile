# Utiliser une version LTS spécifique de Node.js (branche 22.x), variante slim recommandée pour le développement
FROM node:22.15.1-slim

WORKDIR /app

# Installer et configurer Corepack pour gérer PNPM
RUN npm install -g corepack@latest
RUN corepack enable
# Préparer une version spécifique de pnpm
RUN corepack prepare pnpm@10.7.1 --activate

# Les fichiers source seront montés via un volume dans docker-compose.yml
# Nous ne copions donc que les fichiers de dépendances pour l'installation initiale
COPY package.json pnpm-lock.yaml ./

# Installer les dépendances, y compris les devDependencies pour le développement
RUN pnpm install

# Exposer le port du serveur de développement Astro
EXPOSE 4321

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
     CMD curl -f http://localhost:4321/ || exit 1²


# Commande par défaut pour le serveur de développement
# La commande réelle sera remplacée par celle du docker-compose.yml (pnpm dev --host)
CMD ["pnpm", "dev", "--host"]
# Utiliser une version LTS spécifique de Node.js (branche 22.x), variante slim recommandée pour le développement
FROM node:22.15.1-slim

WORKDIR /app

# Installer et configurer Corepack pour gérer PNPM
RUN npm install -g corepack@latest
RUN corepack enable
# Préparer une version spécifique de pnpm
RUN corepack prepare pnpm@10.7.1 --activate

# Les fichiers source seront montés via un volume dans docker-compose.yml
# Nous ne copions donc que les fichiers de dépendances pour l'installation initiale
COPY package.json pnpm-lock.yaml ./

# Installer les dépendances, y compris les devDependencies pour le développement
RUN pnpm install

# Exposer le port du serveur de développement Astro
EXPOSE 4321

# Commande par défaut pour le serveur de développement
# La commande réelle sera remplacée par celle du docker-compose.yml (pnpm dev --host)
CMD ["pnpm", "dev", "--host"] 