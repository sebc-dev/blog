# Story 1.11: Configuration Connexion BD et Logs Backend

**Status:** Draft

## Goal & Context

**User Story:** En tant que Développeur (Dev), je veux configurer la connexion à la base de données PostgreSQL et la gestion de base des logs pour le backend afin de permettre au backend de communiquer avec la base de données et de logger les informations.

**Context:** Cette story fait suite à l'initialisation du projet Spring Boot (Story 1.10) et à la mise en place du service PostgreSQL (Story 1.4). Elle connecte l'application backend à sa source de données et établit les fondations pour l'observabilité.

## Detailed Requirements

Configurer le fichier `application.yml` (ou `.properties`) pour permettre à l'application Spring Boot de se connecter à la base de données PostgreSQL en utilisant les variables d'environnement. Configurer Logback (via `logback-spring.xml` ou la configuration Spring Boot par défaut) pour des logs structurés (JSON si possible) avec des niveaux appropriés pour les environnements de dev et de prod.

## Acceptance Criteria (ACs)

- AC1: La configuration de la source de données (datasource) pour PostgreSQL est définie dans `backend/src/main/resources/application.yml` (ou `.properties`).
- AC2: L'URL de la base de données, le nom d'utilisateur et le mot de passe sont lus à partir des variables d'environnement (`SPRING_DATASOURCE_URL` implicitement construite, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` qui référencent `POSTGRES_USER`, `POSTGRES_DB`, `POSTGRES_PASSWORD` du `.env`).
- AC3: L'application Spring Boot peut démarrer avec succès et établir une connexion à la base de données PostgreSQL (configurée dans la Story 1.4) lorsqu'elle est lancée via Docker Compose avec les bonnes variables d'environnement.
- AC4: La configuration de logging de base est en place (via Logback, par défaut avec Spring Boot) et permet de logger des messages à différents niveaux (INFO, DEBUG).
- AC5: (Optionnel mais recommandé) Les logs en production (ou via un profil `prod`) sont configurés pour être structurés en JSON pour une meilleure analyse par des outils de centralisation de logs.
- AC6: Les configurations Liquibase de base sont présentes pour permettre l'exécution des migrations (ex: `spring.liquibase.change-log=classpath:/db/changelog/db.changelog-master.xml`).

## Technical Implementation Context

**Guidance:** Modifier `application.yml` et potentiellement ajouter `logback-spring.xml`. Utiliser les profils Spring (`application-dev.yml`, `application-prod.yml`) pour des configurations de logging différentes si nécessaire.

- **Relevant Files:**
  - Files to Create/Modify:
    - `backend/src/main/resources/application.yml` (ou `application.properties`)
    - `backend/src/main/resources/application-dev.yml` (optionnel, pour logging DEBUG)
    - `backend/src/main/resources/application-prod.yml` (optionnel, pour logging JSON)
    - `backend/src/main/resources/logback-spring.xml` (optionnel, pour configuration avancée des logs comme JSON)
    - `backend/src/main/resources/db/changelog/db.changelog-master.xml` (fichier Liquibase principal, peut être vide initialement ou pointer vers le premier script de création de table).
  - _(Hint: Consulter la documentation Spring Boot pour la configuration de la datasource et du logging. Se référer à `docs/setup/environnement-vars.md` pour les noms des variables et `docs/observabilite/strategie-observabilite.md` pour la stratégie de logging.)_

- **Key Technologies:**
  - Spring Boot
  - PostgreSQL
  - Logback (SLF4J)
  - Liquibase
  - YAML (pour configuration)
  - _(Hint: Voir `docs/teck-stack.md`)_

- **API Interactions / SDK Usage:**
  - Non applicable pour cette story.

- **UI/UX Notes:**
  - Non applicable pour cette story.

- **Data Structures:**
  - Non applicable pour cette story (la définition des tables via Liquibase est pour plus tard, mais la configuration pour que Liquibase s'exécute est attendue).

- **Environment Variables:**
  - `SPRING_PROFILES_ACTIVE` (pour activer `dev` ou `prod`)
  - `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` (utilisées par Spring Boot via `SPRING_DATASOURCE_USERNAME`, etc.)
  - `LOGGING_LEVEL_ROOT`, `LOGGING_LEVEL_FR_KALIFAZZIA` (comme défini dans `docs/environnement-vars.md`)
  - _(Hint: Voir `docs/environnement-vars.md`)_

- **Coding Standards Notes:**
  - La configuration doit être claire et utiliser les conventions Spring Boot.
  - Les logs doivent être informatifs.
  - _(Hint: Voir `docs/normes-codage.md`)_

## Tasks / Subtasks

- [ ] Configurer la connexion à la base de données dans `backend/src/main/resources/application.yml`:
    ```yaml
    spring:
      application:
        name: blog-technique-backend
      datasource:
        url: jdbc:postgresql://${DB_HOST:db}:${DB_PORT:5432}/${POSTGRES_DB} # db est le nom du service Docker de PostgreSQL
        username: ${POSTGRES_USER}
        password: ${POSTGRES_PASSWORD}
        driver-class-name: org.postgresql.Driver
      jpa:
        hibernate:
          ddl-auto: validate # Liquibase gérera le schéma
        properties:
          hibernate:
            dialect: org.hibernate.dialect.PostgreSQLDialect
            #jdbc.time_zone: UTC # Recommandé pour OffsetDateTime
      liquibase:
        change-log: classpath:/db/changelog/db.changelog-master.xml
        enabled: true # S'assurer que Liquibase est activé
    
    logging:
      level:
        root: ${LOGGING_LEVEL_ROOT:INFO}
        fr.kalifazzia: ${LOGGING_LEVEL_FR_KALIFAZZIA:INFO} # Package de l'application
    
    # Configuration de base pour Actuator (health endpoint)
    management:
      endpoints:
        web:
          exposure:
            include: health,info,liquibase # Exposer liquibase endpoint
    ```
- [ ] (Optionnel) Créer `application-dev.yml` pour surcharger le niveau de log en mode développement :
    ```yaml
    logging:
      level:
        fr.kalifazzia: DEBUG
        org.springframework.web: DEBUG # Utile pour voir les requêtes
        #org.hibernate.SQL: DEBUG # Pour voir les requêtes SQL générées
        #org.hibernate.type.descriptor.sql: TRACE # Pour voir les paramètres des requêtes SQL
    ```
- [ ] (Optionnel, pour logs JSON) Créer `backend/src/main/resources/logback-spring.xml` et configurer un appender JSON (ex: `net.logstash.logback.encoder.LogstashEncoder`). Ceci est une configuration plus avancée. Pour le MVP, les logs par défaut peuvent suffire.
    * Si `logback-spring.xml` est créé, s'assurer qu'il est correctement référencé ou pris en compte par Spring Boot.
- [ ] Créer la structure de répertoires et le fichier master pour Liquibase :
    - `mkdir -p backend/src/main/resources/db/changelog/changes`
    - Créer `backend/src/main/resources/db/changelog/db.changelog-master.xml` (peut être vide ou inclure le premier script si disponible). Exemple de contenu vide initial :
    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <databaseChangeLog
            xmlns="[http://www.liquibase.org/xml/ns/dbchangelog](http://www.liquibase.org/xml/ns/dbchangelog)"
            xmlns:xsi="[http://www.w3.org/2001/XMLSchema-instance](http://www.w3.org/2001/XMLSchema-instance)"
            xsi:schemaLocation="[http://www.liquibase.org/xml/ns/dbchangelog](http://www.liquibase.org/xml/ns/dbchangelog)
                               [http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-latest.xsd](http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-latest.xsd)">
        </databaseChangeLog>
    ```
- [ ] Mettre à jour `docker-compose.yml` pour le service backend afin de s'assurer qu'il dépend de `db` (`depends_on`) et qu'il utilise les bonnes variables d'environnement pour la base de données et le profil actif.
- [ ] Lancer l'ensemble des services (`db` et `backend`) via `docker compose up --build backend` (ou `docker compose up -d`).
- [ ] Vérifier les logs du backend pour confirmer une connexion réussie à la base de données et l'initialisation de Liquibase.
- [ ] Accéder à l'endpoint Actuator `/actuator/health` du backend (via Traefik si déjà configuré ou en exposant temporairement le port du backend) pour vérifier l'état de santé (devrait inclure `db` et `liquibase` comme `UP`).

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.
- **Manual/CLI Verification:**
  - Les logs de l'application Spring Boot doivent indiquer une connexion réussie à PostgreSQL.
  - Les logs doivent indiquer que Liquibase s'est exécuté (même s'il n'y a pas encore de migrations à appliquer).
  - L'endpoint `/actuator/health` doit montrer un statut `UP` pour les composants `db` et `liquibase`.
  - Modifier les niveaux de log via les variables d'environnement ou les profils et observer le changement dans la verbosité des logs.
- _(Hint: Voir `docs/strategie-tests.md`, `docs/observabilite/strategie-observabilite.md`)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
- **Change Log:**
  - Initial Draft