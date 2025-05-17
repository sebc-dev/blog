# Blog Technique Bilingue - Variables d'Environnement

Ce document liste et décrit les variables d'environnement utilisées par les différentes composantes du projet "Blog Technique Bilingue". Il précise également leur sensibilité et les bonnes pratiques pour leur gestion.

## Mécanisme de Chargement de la Configuration

- **Développement Local :**
  - Un fichier `.env` à la racine du projet est utilisé pour définir les variables d'environnement. Ce fichier est chargé par Docker Compose au démarrage des services.
  - Pour les développements en dehors de Docker (ex: exécution directe de l'application Spring Boot ou du serveur de dev Astro depuis l'IDE), les variables peuvent être chargées via les configurations de lancement de l'IDE ou en utilisant des bibliothèques comme `dotenv` (pour Node.js, si nécessaire, bien qu'Astro gère nativement certaines variables via `import.meta.env`). Spring Boot peut lire les variables d'environnement du système.
  - Un fichier `.env.example` est versionné dans le dépôt Git pour servir de modèle. **Le fichier `.env` contenant des valeurs réelles ne doit jamais être commité.**
- **Déploiement (Production sur VPS) :**
  - Les variables d'environnement sont injectées dans les conteneurs Docker via les fichiers `docker-compose.yml` utilisés en production.
  - Les valeurs de ces variables (surtout les secrets) sont stockées de manière sécurisée sur le serveur VPS dans des fichiers `.env` spécifiques à chaque service (par exemple, `/srv/docker/proxy/.env` pour Traefik, `/srv/docker/apps/site/.env` pour la stack applicative) qui sont référencés par les fichiers `docker-compose.yml` de production correspondants. Ces fichiers doivent avoir des permissions très restrictives (ex: `chmod 600`, propriétaire `root` ou un utilisateur de déploiement dédié).
  - Pour les informations sensibles comme les identifiants PostgreSQL, l'approche privilégiée est l'utilisation de **Docker Secrets** (via des fichiers dans `/srv/docker/postgre/secrets/`) plutôt que des variables d'environnement.
  - Les secrets nécessaires au pipeline CI/CD (GitHub Actions) sont gérés via les "Encrypted Secrets" de GitHub Actions.

## Variables d'Environnement Requises et Optionnelles

Le tableau suivant détaille les variables d'environnement utilisées.

| Nom de la Variable                  | Description                                                                 | Exemple / Valeur par Défaut                                      | Requis? (Oui/Non)     | Sensible? (Oui/Non) | Utilisé par          |
| :---------------------------------- | :-------------------------------------------------------------------------- | :--------------------------------------------------------------- | :-------------------- | :------------------ | :------------------- |
| **GLOBAL (via `.env`)**             |                                                                             |                                                                  |                       |                     |                      |
| `COMPOSE_PROJECT_NAME`              | Nom du projet Docker Compose (utile pour isoler les réseaux/volumes)        | `blogtechnique`                                                  | Non                   | Non                 | Docker Compose       |
| `TZ`                                | Fuseau horaire pour les conteneurs (ex: logs)                               | `Europe/Paris`                                                   | Non                   | Non                 | Tous conteneurs      |
| **POSTGRESQL (Backend)**            |                                                                             |                                                                  |                       |                     | PostgreSQL, Backend  |
| `POSTGRES_USER`                     | **(Dev)** Nom d'utilisateur pour la base de données PostgreSQL.             | `bloguser`                                                       | Oui (dev)             | Oui                 | PostgreSQL, Backend  |
| `POSTGRES_PASSWORD`                 | **(Dev)** Mot de passe pour l'utilisateur PostgreSQL.                       | `AVotreChoixSecurise`                                            | Oui (dev)             | Oui                 | PostgreSQL, Backend  |
| `POSTGRES_USER_FILE`                | **(Prod)** Chemin vers le fichier de secret contenant l'utilisateur PG.     | `/run/secrets/db_user`                                           | Oui (prod)            | Non (chemin)        | PostgreSQL           |
| `POSTGRES_PASSWORD_FILE`            | **(Prod)** Chemin vers le fichier de secret contenant le mot de passe PG.   | `/run/secrets/db_password`                                       | Oui (prod)            | Non (chemin)        | PostgreSQL           |
| `POSTGRES_DB`                       | Nom de la base de données PostgreSQL.                                       | `blog_db`                                                        | Oui                   | Non                 | PostgreSQL, Backend  |
| `POSTGRES_PORT_HOST`                | Port de l'hôte exposé pour PostgreSQL (dev local).                          | `5432`                                                           | Non (pour dev)        | Non                 | Docker Compose (dev) |
| `PGDATA`                            | Chemin de persistance des données PostgreSQL dans le conteneur.             | `/var/lib/postgresql/data/pgdata`                                | Non (interne PG)      | Non                 | PostgreSQL           |
| **BACKEND (Spring Boot)**           |                                                                             |                                                                  |                       |                     | Backend              |
| `SPRING_PROFILES_ACTIVE`            | Profils Spring Boot actifs (ex: `dev`, `prod`).                             | `dev` (local), `prod` (VPS)                                      | Non                   | Non                 | Backend              |
| `SPRING_DATASOURCE_URL`             | URL de connexion JDBC à PostgreSQL (généralement construite dynamiquement). | `jdbc:postgresql://db:5432/blog_db`                              | Oui (implicite)       | Non                 | Backend              |
| `SPRING_DATASOURCE_USERNAME`        | Utilisateur pour la connexion JDBC (référence `POSTGRES_USER`).             | `${POSTGRES_USER}`                                               | Oui (implicite)       | Non                 | Backend              |
| `SPRING_DATASOURCE_PASSWORD`        | Mot de passe pour la connexion JDBC (référence `POSTGRES_PASSWORD`).        | `${POSTGRES_PASSWORD}`                                           | Oui (implicite)       | Oui                 | Backend              |
| `SERVER_PORT`                       | Port sur lequel l'application Spring Boot écoute dans le conteneur.         | `8080`                                                           | Non                   | Non                 | Backend              |
| `LOGGING_LEVEL_ROOT`                | Niveau de log racine pour Spring Boot.                                      | `INFO`                                                           | Non                   | Non                 | Backend              |
| `LOGGING_LEVEL_FR_KALIFAZZIA`       | Niveau de log spécifique pour les packages de l'application.                | `DEBUG` (dev), `INFO` (prod)                                     | Non                   | Non                 | Backend              |
| **FRONTEND (Astro)**                |                                                                             |                                                                  |                       |                     | Frontend             |
| `PUBLIC_API_BASE_URL`               | URL de base pour appeler l'API backend depuis le client.                    | `/api/v1` (via Traefik)                                          | Oui                   | Non                 | Frontend (client)    |
| **TRAEFIK (Proxy)**                 |                                                                             |                                                                  |                       |                     | Traefik              |
| `TRAEFIK_DOMAIN_MAIN`               | Domaine principal de l'application.                                         | `monsite.com`                                                    | Oui                   | Non                 | Traefik              |
| `TRAEFIK_HTTPS_REDIRECT`            | Activation de la redirection HTTP vers HTTPS.                               | `true`                                                           | Non                   | Non                 | Traefik              |
| `TRAEFIK_ACME_EMAIL`                | Email pour Let's Encrypt.                                                   | `admin@monsite.com`                                              | Oui (pour Let's E.)   | Non                 | Traefik              |
| `TRAEFIK_ACME_CASERVER`             | URL du serveur CA Let's Encrypt (prod ou staging).                           | `https://acme-v02.api.letsencrypt.org/directory`                 | Non                   | Non                 | Traefik              |
| `TRAEFIK_ACME_RESOLVERS`            | Résolveurs DNS à utiliser pour le DNS Challenge.                            | `1.1.1.1:53,8.8.8.8:53`                                          | Non                   | Non                 | Traefik              |
| `TRAEFIK_SUBDOMAIN`                 | Sous-domaine pour le dashboard Traefik.                                     | `traefik`                                                        | Non                   | Non                 | Traefik              |
| `TRAEFIK_LOG_LEVEL`                 | Niveau de log pour Traefik.                                                 | `INFO` (prod), `DEBUG` (dev)                                     | Non                   | Non                 | Traefik              |
| `TRAEFIK_ACCESS_LOGS`               | Activation des logs d'accès.                                                | `true`                                                           | Non                   | Non                 | Traefik              |
| `OVH_APPLICATION_KEY`               | Clé d'API OVH pour le DNS Challenge.                                        | `XXX_VOTRE_CLE_XXX`                                              | Oui (pour OVH DNS)    | Oui                 | Traefik              |
| `OVH_APPLICATION_SECRET`            | Secret d'API OVH pour le DNS Challenge.                                     | `XXX_VOTRE_SECRET_XXX`                                           | Oui (pour OVH DNS)    | Oui                 | Traefik              |
| `OVH_CONSUMER_KEY`                  | Consumer Key OVH pour le DNS Challenge.                                     | `XXX_VOTRE_CLE_CONSOMMATEUR_XXX`                                 | Oui (pour OVH DNS)    | Oui                 | Traefik              |
| `OVH_ENDPOINT_CONFIG`               | Endpoint OVH pour le DNS Challenge.                                         | `ovh-europe`                                                     | Oui (pour OVH DNS)    | Non                 | Traefik              |
| `TRAEFIK_DASHBOARD_USER`            | Utilisateur pour l'authentification du dashboard Traefik (si activé).       | `admin`                                                          | Non                   | Oui                 | Traefik              |
| `TRAEFIK_DASHBOARD_PASSWORD_HASHED` | Mot de passe **haché** pour l'authentification du dashboard Traefik.        | `UnMotDePasseHacheValide`                                        | Non                   | Oui                 | Traefik              |

**Notes sur les préfixes `PUBLIC_` pour Astro :**
Dans Astro, les variables d'environnement préfixées par `PUBLIC_` sont exposées au code côté client (navigateur). Les autres variables ne sont disponibles que côté serveur (pendant le build ou en mode SSR).

## Gestion des Variables Sensibles en Production

Pour sécuriser les informations sensibles en production, deux approches complémentaires sont utilisées :

1. **Docker Secrets pour PostgreSQL (/srv/docker/postgre/) :**
   - Les identifiants PostgreSQL sont stockés comme des fichiers texte dans `/srv/docker/postgre/secrets/` :
     - `postgres_user.txt` : Contient le nom d'utilisateur
     - `postgres_password.txt` : Contient le mot de passe
   - Ces fichiers ont des permissions restrictives : `chmod 600` (lecture/écriture pour le propriétaire uniquement)
   - Dans le `docker-compose.yml`, ces secrets sont référencés via la section `secrets` et rendus disponibles au conteneur PostgreSQL via les variables `POSTGRES_USER_FILE` et `POSTGRES_PASSWORD_FILE` plutôt que les variables d'environnement standard.

2. **Fichiers .env pour les Autres Services :**
   - Les variables non sensibles peuvent être stockées dans des fichiers `.env` spécifiques à chaque service.
   - Pour les autres services ayant besoin d'accéder à PostgreSQL, les identifiants peuvent être montés via des secrets Docker ou des variables d'environnement selon le niveau de sécurité requis.

## Notes

- **Gestion des Secrets :**
  - **NE JAMAIS COMMITTER DE SECRETS DANS GIT.** Utilisez le fichier `.gitignore` pour exclure les fichiers `.env` et les répertoires `secrets/`.
  - **Production :** Les fichiers `.env` et les secrets sur le serveur VPS doivent avoir des permissions minimales (ex: `chmod 600`) et appartenir à un utilisateur non privilégié ou à `root` avec un accès limité pour le processus de déploiement. L'utilisation de solutions de gestion de secrets dédiées (comme HashiCorp Vault, AWS Secrets Manager, etc.) est recommandée pour des projets plus importants mais est hors scope pour ce MVP sur un VPS unique.
  - **CI/CD :** Utiliser les mécanismes de secrets intégrés à la plateforme CI/CD (ex: GitHub Actions Encrypted Secrets).

## Change Log

| Change        | Date       | Version | Description                                        | Author              |
| ------------- | ---------- | ------- | -------------------------------------------------- | ------------------- |
| Initial draft | 2025-05-11 | 0.1     | Création initiale du document des variables d'env. | 3 - Architecte (IA) |
| Update        | 2025-05-15 | 0.2     | Ajout des détails sur l'utilisation des Docker Secrets pour PostgreSQL. | 3 - Architecte (IA) |
