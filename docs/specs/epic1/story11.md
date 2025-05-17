# Story 1.11: Configuration Connexion BD et Logs Backend

**Status:** Draft

## Goal & Context

**User Story:** En tant que Développeur (Dev), je veux configurer la connexion à la base de données PostgreSQL et la gestion de base des logs pour le backend afin de permettre au backend de communiquer avec la base de données et de logger les informations.

**Context:** Cette story fait suite à l'initialisation du projet Spring Boot (Story 1.10) et à la mise en place du service PostgreSQL (Story 1.4). Elle connecte l'application backend à sa source de données et établit les fondations pour l'observabilité.

## Detailed Requirements

Configurer le fichier `application.yml` (ou `.properties`) pour permettre à l'application Spring Boot de se connecter à la base de données PostgreSQL en utilisant les variables d'environnement. Configurer Logback (via `logback-spring.xml` ou la configuration Spring Boot par défaut) pour des logs structurés (JSON si possible) avec des niveaux appropriés pour les environnements de dev et de prod.

## Acceptance Criteria (ACs)

- AC1: La configuration de la source de données (datasource) pour PostgreSQL est définie dans `backend/src/main/resources/application.yml` (ou `.properties`).
- AC2: En développement, l'URL de la base de données, le nom d'utilisateur et le mot de passe sont lus à partir des variables d'environnement (`SPRING_DATASOURCE_URL` implicitement construite, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` qui référencent `POSTGRES_USER`, `POSTGRES_DB`, `POSTGRES_PASSWORD` du `.env`).
- AC3: En production, l'application peut se connecter au service PostgreSQL qui utilise des Docker Secrets situés dans `/srv/docker/postgre/secrets/`.
- AC4: L'application Spring Boot peut démarrer avec succès et établir une connexion à la base de données PostgreSQL (configurée dans la Story 1.4) lorsqu'elle est lancée via Docker Compose avec les bonnes variables d'environnement.
- AC5: La configuration de logging de base est en place (via Logback, par défaut avec Spring Boot) et permet de logger des messages à différents niveaux (INFO, DEBUG).

## Technical Implementation Context

**Guidance:** Utiliser les informations suivantes pour l'implémentation.

- **Relevant Files:**
  - Files to Create/Modify:
    - `backend/src/main/resources/application.yml`: Configurer la datasource pour PostgreSQL et la gestion des logs.
    - `backend/src/main/resources/application-dev.yml`: Configuration spécifique pour le développement local (optionnel).
    - `backend/src/main/resources/application-prod.yml`: Configuration spécifique pour la production (optionnel).
  - _(Hint: Voir `docs/project-structure.md`)_

- **Key Technologies:**
  - Spring Boot
  - PostgreSQL (JDBC Driver)
  - Logback
  - _(Hint: Voir `docs/teck-stack.md`)_

- **API Interactions / SDK Usage:**
  - Spring Data JPA / DataSource
  - Logback Configuration
  - Liquibase (préparer le terrain pour les futures migrations)

- **UI/UX Notes:**
  - Non applicable pour cette story.

- **Data Structures:**
  - Non applicable pour cette story (la définition des tables via Liquibase est pour plus tard, mais la configuration pour que Liquibase s'exécute est attendue).

- **Environment Variables:**
  - `SPRING_PROFILES_ACTIVE` (pour activer `dev` ou `prod`)
  - **Développement** : 
    - `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` (utilisées par Spring Boot via `SPRING_DATASOURCE_USERNAME`, etc.)
  - **Production** : 
    - L'application doit pouvoir se connecter au service PostgreSQL qui utilise des Docker Secrets dans `/srv/docker/postgre/secrets/`
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
            include: "health"
      endpoint:
        health:
          show-details: never # en prod, ne pas exposer les détails (à mettre dans application-prod.yml)
    ```
    
- [ ] (Optionnel) Créer `backend/src/main/resources/application-dev.yml` pour des configurations spécifiques au développement :
    ```yaml
    # Application profile dev
    
    spring:
      jpa:
        show-sql: true
        properties:
          hibernate:
            format_sql: true
    
    logging:
      level:
        org.hibernate.SQL: DEBUG # SQL logs uniquement en dev
        org.hibernate.type.descriptor.sql.BasicBinder: TRACE # paramètres SQL en dev
    
    management:
      endpoint:
        health:
          show-details: always # en dev, exposer les détails pour le diagnostic
    ```
    
- [ ] (Optionnel) Créer `backend/src/main/resources/application-prod.yml` pour des configurations spécifiques à la production :
    ```yaml
    # Application profile prod
    
    # Aucune configuration spécifique nécessaire pour l'instant, car application.yml a de bonnes valeurs par défaut.
    ```

- [ ] Adapter le fichier `docker-compose.yml` (ou `.prod.yml` pour la production) pour le backend en s'assurant que les variables d'environnement nécessaires sont injectées dans le conteneur, incluant la connexion à PostgreSQL :
    ```yaml
    # Exemple pour l'environnement de développement
    backend:
      # ...
      environment:
        SPRING_PROFILES_ACTIVE: dev
        POSTGRES_USER: ${POSTGRES_USER}
        POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
        POSTGRES_DB: ${POSTGRES_DB}
        DB_HOST: db # nom du service PostgreSQL
        DB_PORT: 5432
        LOGGING_LEVEL_ROOT: INFO
        LOGGING_LEVEL_FR_KALIFAZZIA: DEBUG
      depends_on:
        - db
      # ...
    ```

- [ ] Pour l'environnement de production, assurer la connexion au service PostgreSQL qui utilise des Docker Secrets :
    ```yaml
    # Exemple pour l'environnement de production dans apps/site/docker-compose.prod.yml
    backend:
      # ...
      environment:
        SPRING_PROFILES_ACTIVE: prod
        DB_HOST: db # ou l'adresse complète du service PostgreSQL depuis /srv/docker/postgre/
        DB_PORT: 5432
        POSTGRES_DB: ${POSTGRES_DB}
        # Les credentials sont gérés via des secrets pour PostgreSQL
        POSTGRES_USER: ${POSTGRES_USER} # Ces variables doivent être définies pour Spring
        POSTGRES_PASSWORD: ${POSTGRES_PASSWORD} # même si PostgreSQL utilise des secrets
      # ...
      networks:
        - site_net # réseau partagé avec PostgreSQL
        - webproxy_net # pour exposition par Traefik
    ```

- [ ] Tester localement la connexion à la base de données en démarrant le backend avec Docker Compose et en vérifiant les logs pour confirmer une connexion réussie.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs.

- **Manual/CLI Verification:**
  - Lancer `docker compose up -d` et vérifier les logs du backend pour s'assurer qu'il démarre correctement.
  - Vérifier les journaux pour voir s'il y a des erreurs liées à la configuration de la source de données.
  - S'assurer que l'application peut se connecter à la base de données PostgreSQL (visible dans les logs).
  - Vérifier que le niveau de log est respecté (INFO, DEBUG selon le profil).
- **Test d'Intégration:**
  - Si possible, écrire un test d'intégration simple qui vérifie la connexion à la base de données.

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
- **Change Log:**
  - Initial Draft