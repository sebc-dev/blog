# Blog Technique Bilingue - Variables d'Environnement

Ce document liste et décrit les variables d'environnement utilisées par les différentes composantes du projet "Blog Technique Bilingue". Il précise également leur sensibilité et les bonnes pratiques pour leur gestion.

## Mécanisme de Chargement de la Configuration

-   **Développement Local :**
    -   Un fichier `.env` à la racine du projet est utilisé pour définir les variables d'environnement. Ce fichier est chargé par Docker Compose au démarrage des services.
    -   Pour les développements en dehors de Docker (ex: exécution directe de l'application Spring Boot ou du serveur de dev Astro depuis l'IDE), les variables peuvent être chargées via les configurations de lancement de l'IDE ou en utilisant des bibliothèques comme `dotenv` (pour Node.js, si nécessaire, bien qu'Astro gère nativement certaines variables via `import.meta.env`). Spring Boot peut lire les variables d'environnement du système.
    -   Un fichier `.env.example` est versionné dans le dépôt Git pour servir de modèle. **Le fichier `.env` contenant des valeurs réelles ne doit jamais être commité.**
-   **Déploiement (Production sur VPS) :**
    -   Les variables d'environnement sont injectées dans les conteneurs Docker via le fichier `docker-compose.yml` utilisé en production.
    -   Les valeurs de ces variables (surtout les secrets) sont stockées de manière sécurisée sur le serveur VPS dans un fichier `.env` (par exemple, `/opt/blog-technique-bilingue/.env`) qui est référencé par le `docker-compose.yml` de production. Ce fichier doit avoir des permissions très restrictives (ex: `chmod 600`, propriétaire `root` ou un utilisateur de déploiement dédié).
    -   Les secrets nécessaires au pipeline CI/CD (GitHub Actions) sont gérés via les "Encrypted Secrets" de GitHub Actions.

## Variables d'Environnement Requises et Optionnelles

Le tableau suivant détaille les variables d'environnement utilisées.

| Nom de la Variable        | Description                                                                | Exemple / Valeur par Défaut        | Requis? (Oui/Non) | Sensible? (Oui/Non) | Utilisé par        |
| :------------------------ | :------------------------------------------------------------------------- | :--------------------------------- | :---------------- | :------------------ | :----------------- |
| **GLOBAL (via `.env`)** |                                                                            |                                    |                   |                     |                    |
| `COMPOSE_PROJECT_NAME`    | Nom du projet Docker Compose (utile pour isoler les réseaux/volumes)       | `blogtechnique`                    | Non               | Non                 | Docker Compose     |
| `TZ`                      | Fuseau horaire pour les conteneurs (ex: logs)                              | `Europe/Paris`                     | Non               | Non                 | Tous conteneurs    |
| **POSTGRESQL (Backend)** |                                                                            |                                    |                   |                     | PostgreSQL, Backend |
| `POSTGRES_USER`           | Nom d'utilisateur pour la base de données PostgreSQL.                       | `bloguser`                         | Oui               | Oui                 | PostgreSQL, Backend |
| `POSTGRES_PASSWORD`       | Mot de passe pour l'utilisateur PostgreSQL.                                 | `AVotreChoixSecurise`              | Oui               | Oui                 | PostgreSQL, Backend |
| `POSTGRES_DB`             | Nom de la base de données PostgreSQL.                                       | `blog_db`                          | Oui               | Non                 | PostgreSQL, Backend |
| `POSTGRES_PORT_HOST`      | Port de l'hôte exposé pour PostgreSQL (dev local).                          | `5432`                             | Non (pour dev)    | Non                 | Docker Compose (dev)|
| `PGDATA`                  | Chemin de persistance des données PostgreSQL dans le conteneur.             | `/var/lib/postgresql/data/pgdata`  | Non (interne PG)  | Non                 | PostgreSQL         |
| **BACKEND (Spring Boot)** |                                                                            |                                    |                   |                     | Backend            |
| `SPRING_PROFILES_ACTIVE`  | Profils Spring Boot actifs (ex: `dev`, `prod`).                             | `dev` (local), `prod` (VPS)        | Non               | Non                 | Backend            |
| `SPRING_DATASOURCE_URL`   | URL de connexion JDBC à PostgreSQL (généralement construite dynamiquement). | `jdbc:postgresql://db:5432/blog_db`| Oui (implicite)   | Non                 | Backend            |
| `SPRING_DATASOURCE_USERNAME`| Utilisateur pour la connexion JDBC (référence `POSTGRES_USER`).             | `${POSTGRES_USER}`                 | Oui (implicite)   | Non                 | Backend            |
| `SPRING_DATASOURCE_PASSWORD`| Mot de passe pour la connexion JDBC (référence `POSTGRES_PASSWORD`).       | `${POSTGRES_PASSWORD}`             | Oui (implicite)   | Oui                 | Backend            |
| `SERVER_PORT`             | Port sur lequel l'application Spring Boot écoute dans le conteneur.        | `8080`                             | Non               | Non                 | Backend            |
| `LOGGING_LEVEL_ROOT`      | Niveau de log racine pour Spring Boot.                                      | `INFO`                             | Non               | Non                 | Backend            |
| `LOGGING_LEVEL_FR_KALIFAZZIA` | Niveau de log spécifique pour les packages de l'application.             | `DEBUG` (dev), `INFO` (prod)       | Non               | Non                 | Backend            |
| **FRONTEND (Astro)** |                                                                            |                                    |                   |                     | Frontend           |
| `PUBLIC_API_BASE_URL`     | URL de base pour appeler l'API backend depuis le client.                   | `/api/v1` (via Traefik)            | Oui               | Non                 | Frontend (client)  |
| `PUBLIC_SITE_URL`         | URL canonique du site (pour sitemap, SEO).                                 | `http://localhost:4321` (dev) `https://votre-domaine.com` (prod) | Oui               | Non                 | Frontend (build)   |
| `PUBLIC_GOOGLE_ANALYTICS_ID`| ID de suivi Google Analytics (GA4).                                        | `G-XXXXXXXXXX`                     | Non               | Non                 | Frontend (client)  |
| `ASTRO_TELEMETRY_DISABLED`| Désactive la télémétrie d'Astro.                                           | `1`                                | Non               | Non                 | Astro CLI          |
| **TRAEFIK (Reverse Proxy)**|                                                                            |                                    |                   |                     | Traefik            |
| `TRAEFIK_ACME_EMAIL`      | Adresse e-mail pour les certificats Let's Encrypt (production).            | `contact@votre-domaine.com`        | Oui (pour prod HTTPS) | Non               | Traefik            |
| `TRAEFIK_DASHBOARD_USER`  | Utilisateur pour l'authentification du dashboard Traefik (si activé).      | `admin`                            | Non               | Oui                 | Traefik            |
| `TRAEFIK_DASHBOARD_PASSWORD`| Mot de passe pour l'authentification du dashboard Traefik (haché).         | `AVotreChoixSecuriseEtHache`       | Non               | Oui                 | Traefik            |
| `TRAEFIK_DOMAIN_MAIN`     | Domaine principal utilisé par Traefik pour le routage.                     | `votre-domaine.com` ou `localhost` | Oui (pour prod)   | Non                 | Traefik            |

**Notes sur les préfixes `PUBLIC_` pour Astro :**
Dans Astro, les variables d'environnement préfixées par `PUBLIC_` sont exposées au code côté client (navigateur). Les autres variables ne sont disponibles que côté serveur (pendant le build ou en mode SSR).

## Notes

-   **Gestion des Secrets :**
    -   **NE JAMAIS COMMITTER DE SECRETS DANS GIT.** Utilisez le fichier `.gitignore` pour exclure les fichiers `.env`.
    -   **Production :** Les fichiers `.env` sur le serveur VPS doivent avoir des permissions minimales (ex: `chmod 600`) et appartenir à un utilisateur non privilégié ou à `root` avec un accès limité pour le processus de déploiement. L'utilisation de solutions de gestion de secrets dédiées (comme HashiCorp Vault, AWS Secrets Manager, etc.) est recommandée pour des projets plus importants mais est hors scope pour ce MVP sur un VPS unique.
    -   **CI/CD :** Utiliser les mécanismes de secrets intégrés à la plateforme CI/CD (ex: GitHub Actions Encrypted Secrets).
-   **Fichier `.env.example` :**
    -   Un fichier `/.env.example` doit être maintenu à la racine du dépôt. Il doit lister toutes les variables d'environnement nécessaires avec des valeurs d'exemple non sensibles ou des placeholders (ex: `your_api_key_here`).
    -   Ce fichier sert de documentation et de modèle pour créer le fichier `.env` local.
-   **Validation :**
    -   L'application Spring Boot peut valider la présence des variables d'environnement critiques au démarrage et échouer rapidement si elles sont manquantes.
    -   Le frontend Astro peut avoir des vérifications au moment du build pour les variables nécessaires à la génération du site.

## Change Log

| Change        | Date       | Version | Description                                        | Author              |
| ------------- | ---------- | ------- | -------------------------------------------------- | ------------------- |
| Initial draft | 2025-05-11 | 0.1     | Création initiale du document des variables d'env. | 3 - Architecte (IA) |