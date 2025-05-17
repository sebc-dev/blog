Absolument, nous allons ajuster la structure pour que tous les fichiers spécifiques à PostgreSQL soient dans `/srv/docker/postgre/`.

## Story 1.4 (Révisée avec Structure `/srv/docker/postgre/`) : Configuration de Base de PostgreSQL avec Persistance Robuste et Secrets

**Statut :** Brouillon

### Goal & Context

**User Story :** En tant qu'Administrateur Système (Admin), je veux configurer la base de données PostgreSQL dans un conteneur Docker en utilisant un fichier `docker-compose.yml` et des Secrets Docker dédiés, tous situés dans le répertoire `/srv/docker/postgre/` sur le serveur, afin de fournir un stockage de données relationnel fiable pour les métriques de l'application backend.

**Context :** Cette story fait suite à la mise en place de Traefik (Story 1.3) et de Docker (Story 1.2). Elle est cruciale pour le backend Spring Boot. Centraliser tous les fichiers de configuration de PostgreSQL (Compose file, secrets, .env) sous `/srv/docker/postgre/` améliore l'organisation et la modularité des services Docker sur le serveur.

### Detailed Requirements

Déployer un conteneur PostgreSQL (version spécifiée dans `docs/teck-stack.md`) en utilisant un fichier `docker-compose.yml` situé dans `/srv/docker/postgre/`. Configurer l'utilisateur, le mot de passe et le nom de la base de données en utilisant des **Secrets Docker**, dont les fichiers sources seront dans `/srv/docker/postgre/secrets/`. Mettre en place un **volume Docker nommé** pour assurer la persistance des données.

### Acceptance Criteria (ACs)

  * AC1 : Un conteneur PostgreSQL (version spécifiée) est fonctionnel sur le VPS, lancé via `docker compose -f /srv/docker/postgre/docker-compose.yml up -d` (ou en exécutant `docker compose up -d` depuis `/srv/docker/postgre/`).
  * AC2 : Les identifiants de base de données (`POSTGRES_USER`, `POSTGRES_PASSWORD`) sont gérés via des Secrets Docker, avec les fichiers sources dans `/srv/docker/postgre/secrets/`.
  * AC3 : Un volume Docker nommé est correctement créé et monté directement sur `/var/lib/postgresql/data` dans le conteneur.
  * AC4 : La base de données est accessible depuis le réseau Docker interne partagé.
  * AC5 : Les données persistent après un arrêt et redémarrage du conteneur PostgreSQL.
  * AC6 : Les fichiers de secrets sur l'hôte (`/srv/docker/postgre/secrets/*.txt`) sont correctement sécurisés.
  * AC7 : La structure des fichiers sur le serveur respecte `/srv/docker/postgre/` pour le fichier `docker-compose.yml` et `/srv/docker/postgre/secrets/` pour les fichiers de secrets.

### Technical Implementation Context

**Guidance :** Le service PostgreSQL sera défini dans `/srv/docker/postgre/docker-compose.yml`.

  * **Server Directory Structure (cible) :**

    ```
    /srv/docker/
    └── postgre/
        ├── docker-compose.yml
        ├── secrets/
        │   ├── postgres_user.txt
        │   └── postgres_password.txt
        └── .env  (Optionnel, pour les variables non sensibles)
    ```

  * **Relevant Files:**

      * Files to Create/Modify on the server:
          * `/srv/docker/postgre/docker-compose.yml`: Définition du service `db` pour PostgreSQL et la section `secrets`.
          * `/srv/docker/postgre/secrets/postgres_user.txt`: Contient le nom d'utilisateur PostgreSQL.
          * `/srv/docker/postgre/secrets/postgres_password.txt`: Contient le mot de passe PostgreSQL.
          * `/srv/docker/postgre/.env` (Optionnel) : Pour des variables comme `POSTGRES_DB`, `POSTGRES_PORT_HOST`, `COMPOSE_PROJECT_NAME`.
      * Files to Create (sur le poste de développement, si la configuration est versionnée via un git repo racine à `/srv/docker/` ou `/srv/docker/postgre/`) :
          * `.gitignore`: Pour s'assurer que le répertoire `secrets/` (ou son contenu) n'est pas versionné.

  * **Key Technologies:**

      * PostgreSQL (version 16.9 ou compatible)
      * Docker, Docker Compose

  * **Environment Variables (utilisant les versions `_FILE` pour les secrets):**

      * `POSTGRES_PASSWORD_FILE`: Pointant vers `/run/secrets/db_password` (ou le nom du secret choisi) dans le conteneur.
      * `POSTGRES_USER_FILE`: Pointant vers `/run/secrets/db_user` (ou le nom du secret choisi) dans le conteneur.
      * `POSTGRES_DB`: Variable d'environnement classique (via `/srv/docker/postgre/.env`).

  * **Coding Standards Notes:**

      * Utiliser les Secrets Docker pour toutes les informations sensibles.
      * Les fichiers de secrets sur l'hôte (`/srv/docker/postgre/secrets/*`) doivent avoir des permissions restrictives.
      * Utiliser des volumes Docker nommés.

### Tasks / Subtasks

1.  **Préparation sur le serveur :**

      * [ ] Créer l'arborescence : `sudo mkdir -p /srv/docker/postgre/secrets`
      * [ ] Créer les fichiers de secrets avec leur contenu :
          * `sudo sh -c 'echo "mon_utilisateur_pg" > /srv/docker/postgre/secrets/postgres_user.txt'`
          * `sudo sh -c 'echo "mon_mot_de_passe_pg_tres_secret" > /srv/docker/postgre/secrets/postgres_password.txt'`
      * [ ] Définir des permissions restrictives pour les secrets :
          * `sudo chmod 600 /srv/docker/postgre/secrets/*`
          * `sudo chown <votre_utilisateur_admin_docker>:<votre_groupe_admin_docker> /srv/docker/postgre/secrets/*` (adapter si nécessaire)
      * [ ] (Optionnel) Créer et peupler `/srv/docker/postgre/.env` :
        ```env
        # /srv/docker/postgre/.env
        POSTGRES_DB=app_metrics_db
        POSTGRES_PORT_HOST=5432
        COMPOSE_PROJECT_NAME=bilingue_blog_pg # Nom de projet spécifique pour ce compose
        ```

2.  **Création du fichier `/srv/docker/postgre/docker-compose.yml` :**

      * [ ] Créer le fichier avec le contenu suivant (à adapter) :
        ```yaml
        # /srv/docker/postgre/docker-compose.yml
        version: '3.8'

        services:
          db: # Nom du service, sera préfixé par COMPOSE_PROJECT_NAME si défini
            image: postgres:16.9-alpine # ou la version de docs/teck-stack.md
            container_name: ${COMPOSE_PROJECT_NAME:-postgres_db_container} # Nom de conteneur explicite
            restart: unless-stopped
            environment:
              POSTGRES_USER_FILE: /run/secrets/db_user
              POSTGRES_PASSWORD_FILE: /run/secrets/db_password
              POSTGRES_DB: ${POSTGRES_DB} # Provient du fichier .env
            volumes:
              - postgres_data:/var/lib/postgresql/data # Volume nommé
            secrets:
              - db_user   # Nom du secret tel que défini plus bas
              - db_password # Nom du secret tel que défini plus bas
            networks:
              - db_internal_net # Réseau spécifique ou partagé
            ports:
            #  - "${POSTGRES_PORT_HOST:-5432}:5432" # Décommenter si besoin
            healthcheck:
              test: ["CMD-SHELL", "pg_isready -U $$(cat /run/secrets/db_user || echo 'postgres') -d $${POSTGRES_DB} -q"]
              interval: 10s
              timeout: 5s
              retries: 5
              start_period: 30s

        volumes:
          postgres_data: # Nom du volume, sera préfixé par COMPOSE_PROJECT_NAME
            name: ${COMPOSE_PROJECT_NAME:-pg_data}_volume # Nom explicite pour le volume

        secrets:
          db_user:
            file: ./secrets/postgres_user.txt # Chemin relatif au docker-compose.yml
          db_password:
            file: ./secrets/postgres_password.txt # Chemin relatif au docker-compose.yml

        networks:
          db_internal_net: # Nom du réseau, sera préfixé par COMPOSE_PROJECT_NAME
            name: ${COMPOSE_PROJECT_NAME:-pg_network}_default
            driver: bridge
        ```

3.  **Gestion de la configuration (si versionnée) :**

      * [ ] Si le répertoire `/srv/docker/postgre/` ou un de ses parents est un dépôt git, s'assurer que `.gitignore` contient :
        ```gitignore
        # Dans /srv/docker/postgre/.gitignore ou /srv/docker/.gitignore
        **/secrets/
        **/.env
        ```

4.  **Déploiement et vérification :**

      * [ ] Naviguer vers le répertoire : `cd /srv/docker/postgre/`
      * [ ] Lancer le service PostgreSQL : `docker compose up -d` (le `-f docker-compose.yml` est implicite si exécuté depuis ce répertoire)
          * Ou depuis ailleurs : `docker compose -f /srv/docker/postgre/docker-compose.yml up -d`
      * [ ] Vérifier les logs : `docker compose logs -f db` (si exécuté depuis `/srv/docker/postgre/`)
      * [ ] Vérifier que les secrets sont montés : `docker compose exec db ls -l /run/secrets/`
      * [ ] Vérifier la création du volume nommé (le nom sera préfixé, ex: `bilingue_blog_pg_postgres_data_volume`) : `docker volume ls`
      * [ ] Tester la persistance.

### Testing Requirements

**Guidance :** Vérifier l'implémentation par rapport aux ACs.

  * **Manual/CLI Verification:**
      * Exécuter `cd /srv/docker/postgre/` puis `docker compose ps` pour voir le conteneur.
      * Vérifier les logs du conteneur.
      * Lister les volumes et identifier le volume de PostgreSQL.
      * Vérifier l'existence et les permissions des fichiers secrets dans `/srv/docker/postgre/secrets/`.
      * Confirmer la présence des fichiers de secrets dans le conteneur.
      * Effectuer le test de persistance.

### Story Wrap Up (Agent Populates After Execution)

  * **Agent Model Used:** `<Agent Model Name/Version>`
  * **Completion Notes:** {Configuration PostgreSQL déployée avec succès en utilisant la structure de répertoires `/srv/docker/postgre/`. Secrets Docker et volume nommé correctement configurés. Tests de persistance et d'accès validés.}
  * **Change Log:**
      * Adaptation pour la structure de répertoires `/srv/docker/postgre/`.
      * Adaptation pour fichier Compose séparé et structure `/srv/docker/`.
      * Révision pour intégrer l'utilisation des Secrets Docker.
      * Version révisée basée sur le rapport de validation.
      * Initial Draft