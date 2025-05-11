# Story 1.12: Dockerfile pour Backend Spring Boot

**Status:** Draft

## Goal & Context

**User Story:** En tant que Développeur (Dev), je veux préparer un `Dockerfile` pour l'application backend Spring Boot afin de pouvoir conteneuriser l'application backend pour le déploiement.

**Context:** Cette story est cruciale pour le déploiement conteneurisé du backend (Epic 1). Elle s'appuie sur le projet Spring Boot initialisé (Story 1.10) et configuré (Story 1.11), et prépare l'artefact qui sera déployé via Docker Compose.

## Detailed Requirements

Créer un `backend/Dockerfile` multi-stage. Le premier stage ("builder") utilisera Maven pour compiler l'application et packager le JAR. Le second stage ("runner") utilisera une image JRE appropriée (spécifiée dans `docs/teck-stack.md`) pour exécuter l'application Spring Boot. L'application doit s'exécuter en tant qu'utilisateur non-root.

## Acceptance Criteria (ACs)

- AC1: Un fichier `backend/Dockerfile` est créé.
- AC2: Le Dockerfile utilise une approche multi-stage :
    - Un stage "builder" basé sur une image Maven (ex: `eclipse-temurin:21-jdk-jammy` ou `maven:3.9-eclipse-temurin-21`) qui copie les fichiers sources du backend, et exécute `mvn clean package -DskipTests` pour générer le JAR.
    - Un stage "runner" basé sur une image JRE appropriée (ex: `eclipse-temurin:21-jre-jammy`).
- AC3: Le stage "runner" copie le fichier JAR exécutable du stage "builder".
- AC4: Un utilisateur non-root est créé et utilisé pour exécuter l'application Spring Boot dans le stage "runner".
- AC5: Le port de l'application Spring Boot (ex: 8080) est exposé par le conteneur.
- AC6: L'image Docker peut être buildée avec succès (`docker build -t spring-backend-test ./backend`).
- AC7: Un conteneur lancé à partir de l'image buildée démarre l'application Spring Boot avec succès (les logs doivent l'indiquer). L'endpoint `/actuator/health` doit être accessible (si le conteneur est lancé avec le port mappé).

## Technical Implementation Context

**Guidance:** Écrire le `Dockerfile`. Porter une attention particulière à la gestion des couches Docker pour optimiser les builds et à la sécurité (utilisateur non-root).

- **Relevant Files:**
  - Files to Create:
    - `backend/Dockerfile`
  - Files to Modify:
    - (Potentiellement) `backend/.dockerignore` pour optimiser le contexte de build.
  - _(Hint: Voir `docs/project-structure.md` et `docs/operations/runbook.md` pour les aspects de déploiement)_

- **Key Technologies:**
  - Docker
  - Spring Boot
  - Java 21 (JDK pour build, JRE pour run)
  - Maven (pour le build)
  - _(Hint: Voir `docs/teck-stack.md`)_

- **API Interactions / SDK Usage:**
  - Non applicable pour cette story.

- **UI/UX Notes:**
  - Non applicable pour cette story.

- **Data Structures:**
  - Non applicable pour cette story.

- **Environment Variables:**
  - Le Dockerfile peut définir des `ENV` pour des configurations par défaut, mais les variables sensibles ou spécifiques à l'environnement (comme celles pour la DB) seront injectées via Docker Compose.
  - _(Hint: Voir `docs/environnement-vars.md`)_

- **Coding Standards Notes:**
  - Le Dockerfile doit être optimisé pour la taille et le temps de build.
  - Suivre les bonnes pratiques de sécurité pour les Dockerfiles.
  - _(Hint: Voir `docs/normes-codage.md`)_

## Tasks / Subtasks

- [ ] Créer le fichier `backend/.dockerignore` (s'il n'existe pas) pour exclure les répertoires `target/`, `.git/`, `.idea/`, etc., du contexte de build Docker :
    ```
    .git
    .idea
    target/
    *.log
    ```
- [ ] Créer le fichier `backend/Dockerfile` :
    ```dockerfile
    # Stage 1: Build Stage
    FROM maven:3.9.6-eclipse-temurin-21 AS builder
    # Ou FROM eclipse-temurin:21-jdk-jammy AS builder
    # RUN apt-get update && apt-get install -y maven # Si image JDK simple

    WORKDIR /app

    # Copier d'abord le pom.xml pour utiliser le cache Docker pour les dépendances
    COPY pom.xml .
    # Télécharger les dépendances (mode offline peut être plus rapide après le premier build)
    RUN mvn dependency:go-offline -B

    # Copier le reste du code source
    COPY src ./src

    # Compiler et packager l'application, en sautant les tests car ils seront exécutés dans une étape CI séparée
    RUN mvn clean package -DskipTests

    # Stage 2: Runtime Stage
    FROM eclipse-temurin:21-jre-jammy

    WORKDIR /app

    # Créer un utilisateur et un groupe non-root
    RUN groupadd --system appgroup && useradd --system --gid appgroup appuser
    # Donner la propriété du répertoire de travail à l'utilisateur appuser
    RUN chown -R appuser:appgroup /app

    # Copier le JAR depuis le stage de build
    COPY --from=builder /app/target/*.jar app.jar

    # S'assurer que le JAR est exécutable par l'utilisateur appuser
    # (Normalement, les permissions sont déjà correctes, mais on peut s'en assurer)
    # RUN chown appuser:appgroup app.jar

    # Passer à l'utilisateur non-root
    USER appuser

    # Exposer le port sur lequel l'application s'exécute
    EXPOSE 8080

    # Commande pour exécuter l'application
    # Les arguments JVM (comme -Xmx, -Xms) peuvent être ajoutés ici
    # Les profils Spring peuvent être passés via SPRING_PROFILES_ACTIVE dans docker-compose.yml
    ENTRYPOINT ["java", "-jar", "app.jar"]
    ```
- [ ] Builder l'image Docker localement pour tester : `docker build -t spring-backend-test ./backend`.
- [ ] Lancer un conteneur à partir de l'image buildée, en mappant le port et en fournissant les variables d'environnement minimales pour la connexion à la DB si elle est déjà configurée et nécessaire au démarrage complet (sinon, le démarrage du contexte Spring suffit pour ce test) :
    `docker run -d -p 8081:8080 -e POSTGRES_USER=bloguser -e POSTGRES_PASSWORD=yoursecurepassword -e POSTGRES_DB=blog_db spring-backend-test`
    (Adapter les variables d'environnement. Note: si PostgreSQL n'est pas accessible, le health check de la DB échouera, mais l'application devrait tenter de démarrer).
- [ ] Vérifier les logs du conteneur (`docker logs <container_id>`) pour s'assurer que l'application Spring Boot démarre.
- [ ] Si possible, accéder à `http://localhost:8081/actuator/health` pour vérifier l'état.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.
- **Docker Build & Run:**
  - Le build Docker (`docker build ...`) doit se terminer avec succès.
  - Le conteneur Docker doit démarrer sans erreur et les logs doivent indiquer que l'application Spring Boot a démarré.
- **Manual/CLI Verification:**
  - L'endpoint `/actuator/health` (ou un autre endpoint simple) doit être accessible via le port mappé.
  - Vérifier (ex: `docker exec <container_id> ps aux | grep java`) que le processus Java s'exécute en tant qu'utilisateur `appuser` non-root.
- _(Hint: Voir `docs/strategie-tests.md` pour l'approche globale)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
- **Change Log:**
  - Initial Draft