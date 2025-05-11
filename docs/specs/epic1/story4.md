# Story 1.4: Configuration de Base de PostgreSQL avec Persistance

**Status:** Draft

## Goal & Context

**User Story:** En tant qu'Administrateur Système (Admin), je veux configurer la base de données PostgreSQL dans un conteneur Docker, avec persistance des données, afin de fournir un stockage de données relationnel pour les métriques de l'application backend.

**Context:** Cette story fait suite à la mise en place de Traefik (Story 1.3) et de Docker (Story 1.2). Elle est cruciale pour le backend Spring Boot qui stockera les compteurs anonymes de partage et d'utilité des articles. La persistance garantit que les données ne sont pas perdues lors des redémarrages du conteneur.

## Detailed Requirements

Déployer un conteneur PostgreSQL (version spécifiée dans `docs/teck-stack.md`). Configurer les variables d'environnement nécessaires pour l'utilisateur, le mot de passe et le nom de la base de données. Mettre en place un volume Docker pour assurer la persistance des données de PostgreSQL.

## Acceptance Criteria (ACs)

- AC1: Un conteneur PostgreSQL (version spécifiée, ex: 16.9) est fonctionnel sur le VPS.
- AC2: Les variables d'environnement pour `POSTGRES_USER`, `POSTGRES_PASSWORD`, et `POSTGRES_DB` sont configurées et utilisées par le conteneur pour initialiser la base de données et l'utilisateur.
- AC3: Un volume Docker est correctement monté sur `/var/lib/postgresql/data` dans le conteneur pour assurer la persistance des données.
- AC4: La base de données est accessible depuis le réseau Docker interne par le futur service backend (testable ultérieurement, ou via un outil client DB depuis un autre conteneur sur le même réseau si nécessaire pour un test immédiat).
- AC5: Les données persistent après un arrêt et redémarrage du conteneur PostgreSQL (testable en créant une table simple, puis en redémarrant le conteneur et en vérifiant sa présence).

## Technical Implementation Context

**Guidance:** Utiliser les détails suivants pour l'implémentation. Le service PostgreSQL sera défini dans le fichier `docker-compose.yml`.

- **Relevant Files:**
  - Files to Create/Modify:
    - `docker-compose.yml`: Définir le service `db` pour PostgreSQL.
    - `.env`: Ajouter/Vérifier les variables `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`.
  - Files to Create (sur le VPS, géré par Docker):
    - Un répertoire sur l'hôte pour le volume Docker persistant (ex: `/opt/blog-technique-bilingue/pgdata` ou un volume nommé géré par Docker).
  - _(Hint: Voir `docs/project-structure.md`, `docs/architecture/architecture-principale.md` et `docs/data-models.md`)_

- **Key Technologies:**
  - PostgreSQL (version 16.9 ou compatible, voir `docs/teck-stack.md`)
  - Docker, Docker Compose
  - _(Hint: Voir `docs/teck-stack.md`)_

- **API Interactions / SDK Usage:**
  - Non applicable directement pour cette story (le backend interagira avec la DB via JDBC plus tard).

- **UI/UX Notes:**
  - Non applicable pour cette story.

- **Data Structures:**
  - Le schéma initial sera créé par Liquibase dans une story ultérieure (Epic 1, Story E1-B02 pour la configuration backend, et plus spécifiquement lors des premières migrations définies dans `docs/data-models.md`). Cette story se concentre sur la mise en place du service de base de données lui-même.

- **Environment Variables:**
  - `POSTGRES_USER`
  - `POSTGRES_PASSWORD`
  - `POSTGRES_DB`
  - `PGDATA` (variable interne à l'image PostgreSQL, généralement `/var/lib/postgresql/data/pgdata`)
  - `POSTGRES_PORT_HOST` (pour le développement local si le port est exposé, non critique pour la prod interne)
  - _(Hint: Voir `docs/environnement-vars.md`)_

- **Coding Standards Notes:**
  - S'assurer que les mots de passe de base de données sont forts et gérés de manière sécurisée via le fichier `.env`.
  - Suivre les bonnes pratiques pour la configuration des volumes Docker pour la persistance.
  - _(Hint: Voir `docs/normes-codage.md`)_

## Tasks / Subtasks

- [ ] Définir le service `db` dans `docker-compose.yml` :
    - [ ] Utiliser l'image officielle `postgres:<version>` (ex: `postgres:16.9-alpine`).
    - [ ] Configurer les variables d'environnement `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` en utilisant les valeurs du fichier `.env`.
    - [ ] Définir un volume pour la persistance des données. Exemple : `volumes: - postgres_data:/var/lib/postgresql/data` (avec un volume nommé `postgres_data` défini en haut niveau dans `docker-compose.yml`) ou un bind mount vers un chemin sur l'hôte.
    - [ ] Assigner le conteneur à un réseau Docker dédié (ex: `internal_net`) que le backend pourra rejoindre.
    - [ ] (Optionnel pour dev) Exposer le port `5432` à l'hôte pour un accès facile avec des outils clients : `ports: - "${POSTGRES_PORT_HOST:-5432}:5432"`. Pour la production, ce port ne devrait pas être exposé à l'extérieur du VPS.
    - [ ] Configurer `restart: unless-stopped` ou `always`.
- [ ] Mettre à jour le fichier `.env` avec les valeurs pour `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`.
- [ ] Lancer le service PostgreSQL avec `docker compose up -d db`.
- [ ] Vérifier les logs du conteneur `db` pour s'assurer qu'il a démarré correctement et que la base de données a été initialisée.
- [ ] Tester la persistance :
    - [ ] Se connecter à la base de données (ex: via `docker exec -it <container_name> psql -U $POSTGRES_USER -d $POSTGRES_DB`).
    - [ ] Créer une table de test simple.
    - [ ] Arrêter et redémarrer le conteneur (`docker compose stop db`, `docker compose up -d db`).
    - [ ] Se reconnecter et vérifier que la table de test existe toujours.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.
- **Manual/CLI Verification:**
  - Vérifier les logs du conteneur PostgreSQL (`docker logs db_container_name`).
  - Exécuter `docker ps` pour voir le conteneur `db` en cours d'exécution.
  - Exécuter `docker volume ls` pour vérifier la création du volume nommé (si utilisé).
  - Effectuer le test de persistance décrit dans les tâches.
  - (Plus tard) Le backend Spring Boot devra pouvoir se connecter à cette base de données.
- _(Hint: Voir `docs/strategie-tests.md` pour l'approche globale)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
- **Change Log:**
  - Initial Draft