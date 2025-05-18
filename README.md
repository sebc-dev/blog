<a href="https://gitmoji.dev">
  <img
    src="https://img.shields.io/badge/gitmoji-%20😜%20😍-FFDD67.svg?style=flat-square"
    alt="Gitmoji"
  />
</a>
![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/sebc-dev/blog?utm_source=oss&utm_medium=github&utm_campaign=sebc-dev%2Fblog&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

# Blog Technique Bilingue

Un blog technique bilingue (français/anglais) spécialisé dans l'IA, l'UX, l'ingénierie logicielle et le framework Tauri.

## 📝 Description

Ce projet vise à créer une plateforme de contenu technique de haute qualité disponible en français et en anglais. Le blog se concentre sur quatre piliers thématiques principaux :

-   Maîtriser Tauri, Javascript, Typescript, Java, Spring
-   L'IA au service du développeur
-   Excellence en UX Desktop
-   Fondations en ingénierie logicielle

Le site est conçu pour combler le manque de ressources techniques bilingues de qualité, particulièrement pour la communauté francophone.

## 🛠️ Technologies

Le projet utilise une architecture moderne :

-   **Frontend** : Astro avec MDX pour la gestion de contenu
-   **Styling** : TailwindCSS avec DaisyUI
-   **Backend** : Spring Boot (Java 21)
-   **Base de données** : PostgreSQL
-   **Déploiement** : Docker, Traefik, GitHub Actions

## 🌐 Fonctionnalités bilingues

-   Contenu entièrement disponible en français et anglais
-   Navigation fluide entre les versions linguistiques
-   SEO optimisé pour chaque langue
-   URLs localisées
-   Expérience utilisateur adaptée aux préférences linguistiques

## 🚀 Getting Started

Pour lancer le projet en développement :

```bash
# Démarrer Traefik (proxy)
cd infra/proxy
docker compose up -d

# Démarrer la stack d'application (frontend, backend, db)
cd ../site
docker compose up -d

# Ou démarrer les services individuellement
# Frontend
cd frontend
pnpm install
pnpm dev

# Backend
cd backend
./mvnw spring-boot:run
```

## 📁 Structure du projet

Le projet suit une organisation monorepo :

-   `/frontend` - Application Astro (gestion du contenu et affichage)
-   `/backend` - API Spring Boot (métriques et fonctionnalités dynamiques)
-   `/infra` - Configuration Docker Compose pour le développement
    -   `/proxy` - Configuration Traefik
    -   `/site` - Stack d'application (frontend, backend, db)
-   `/docs` - Documentation complète du projet

En production, le projet est déployé selon la structure suivante sur le VPS :

```
/srv/docker/
├── proxy/                       # ⇢ Traefik (entrée unique 80/443)
├── apps/
│   └── site/                    # ⇢ Astro + Spring + PostgreSQL
└── backups/                     # ⇢ Sauvegardes
```

Les images Docker sont construites par GitHub Actions et publiées sur GitHub Container Registry (GHCR).

## 📊 Objectifs

-   Publication hebdomadaire dans les deux langues
-   Devenir une référence pour les développeurs full-stack (25-45 ans)
-   Construire une communauté active autour des thématiques du blog
-   Offrir une valeur tangible pour les projets et le développement professionnel

## 📝 Documentation

Pour plus d'informations sur l'architecture, les standards de code et les processus, consultez le dossier `/docs`.
