Parfait, merci pour ces précisions \! Je vais mettre à jour la story et le `Dockerfile` avec ces informations.

Voici la version finale de la story, intégrant vos réponses :

# Story 1.12: Dockerfile pour Backend Spring Boot (Finalisée)

**Status:** Draft

## Goal & Context

**User Story:** En tant que Développeur (Dev), je veux préparer un `Dockerfile` optimisé et sécurisé pour l'application backend Spring Boot afin de pouvoir conteneuriser l'application backend pour le déploiement, en suivant les bonnes pratiques de mai 2025.

**Context:** Cette story est cruciale pour le déploiement conteneurisé du backend (Epic 1). Elle s'appuie sur le projet Spring Boot initialisé (Story 1.10) et configuré (Story 1.11), et prépare l'artefact qui sera déployé via Docker Compose. Elle intègre les recommandations pour améliorer la sécurité, la maintenabilité et l'efficacité du build en utilisant les "layered JARs" de Spring Boot.

## Detailed Requirements

Créer un `backend/Dockerfile` multi-stage.
Le premier stage ("builder") utilisera l'image `maven:3.9.8-eclipse-temurin-21@sha256:6847cbbf21e159f97819f18336cf6bbc24a89f9eb6439317520d93f904e9a916` pour compiler l'application et packager le JAR.
Un stage intermédiaire ("extractor") utilisera l'image `eclipse-temurin:21-jdk-noble@sha256:92c2f5ad8d51ba7588b0cec663f89a724428f60c2c342a9183908df61903969c` pour décomposer le JAR en couches ("layered JARs").
Le stage final ("runner") utilisera l'image `eclipse-temurin:21-jre-noble@sha256:303f85bdba0b770b2b7050af80128ac7175fce37a31f75ef1990a20d12a37cc6` pour exécuter l'application Spring Boot.
L'application devra s'exécuter en tant qu'utilisateur non-root avec un UID/GID configurables via des `ARG` avec des valeurs par défaut.
Le Dockerfile devra inclure des métadonnées via les `LABEL`s standards OCI et une instruction `HEALTHCHECK` robuste.

## Acceptance Criteria (ACs)

-   AC1: Un fichier `backend/Dockerfile` est créé.
-   AC2: Le Dockerfile utilise une approche multi-stage optimisée :
    -   Un stage "builder" basé sur `maven:3.9.8-eclipse-temurin-21@sha256:6847cbbf21e159f97819f18336cf6bbc24a89f9eb6439317520d93f904e9a916` qui exécute `mvn -B clean package -Dmaven.test.skip=true -Dmaven.wagon.http.retryHandler.count=3` pour générer le JAR.
    -   Un stage "extractor" basé sur `eclipse-temurin:21-jdk-noble@sha256:92c2f5ad8d51ba7588b0cec663f89a724428f60c2c342a9183908df61903969c` pour décomposer le JAR en couches.
    -   Un stage "runner" basé sur `eclipse-temurin:21-jre-noble@sha256:303f85bdba0b770b2b7050af80128ac7175fce37a31f75ef1990a20d12a37cc6`.
-   AC3: Le stage "runner" copie les couches du JAR depuis le stage "extractor" en utilisant `COPY --chown`.
-   AC4: Un utilisateur non-root (ex: `appuser`) est créé avec UID/GID configurables via `ARG` (avec valeurs par défaut) et utilisé pour exécuter l'application. Les permissions des fichiers sont gérées avec `COPY --chown`.
-   AC5: Le port de l'application Spring Boot (par défaut 8080) est exposé par le conteneur.
-   AC6: L'image Docker peut être buildée avec succès (`docker build -t spring-backend-test ./backend`).
-   AC7: Un conteneur lancé à partir de l'image buildée démarre l'application Spring Boot avec succès. L'endpoint `/actuator/health` doit être accessible et répondre positivement.
-   AC8: Le Dockerfile inclut une instruction `HEALTHCHECK` utilisant l'endpoint `/actuator/health`.
-   AC9: Le Dockerfile inclut des `LABEL`s standards OCI pour les métadonnées de l'image.
-   AC10: Le processus Java dans le conteneur utilise des arguments JVM optimisés pour un environnement conteneurisé.

## Technical Implementation Context

**Guidance:** Écrire le `Dockerfile` en portant une attention particulière à la gestion des couches Docker (layered JARs), la sécurité (utilisateur non-root, `COPY --chown`, images de base épinglées), la configuration JVM, et la maintenabilité (commentaires, labels, linter). S'assurer que le `pom.xml` est configuré pour produire des "layered JARs".

-   **Relevant Files:**

    -   Files to Create:
        -   `backend/Dockerfile`
    -   Files to Modify:
        -   `backend/.dockerignore` (doit être exhaustif)
        -   `backend/pom.xml` (pour s'assurer que la configuration du `spring-boot-maven-plugin` active les layers)
    -   _(Hint: Voir `docs/project-structure.md` et `docs/operations/runbook.md`)_

-   **Key Technologies:**

    -   Docker
    -   Spring Boot (avec "layered JARs")
    -   Java 21 (Eclipse Temurin JDK/JRE sur Ubuntu Noble, épinglées)
    -   Maven 3.9.8
    -   _(Hint: Voir `docs/teck-stack.md`. Les alternatives d'images JRE comme Distroless ont été considérées mais `eclipse-temurin:21-jre-noble` est retenue pour son équilibre.)_

-   **Environment Variables:**

    -   Le Dockerfile définira des `ARG` pour `APP_USER`, `APP_GROUP`, `APP_UID`, `APP_GID` (avec valeurs par défaut) et pour les versions des `LABEL`s.
    -   L'`ENTRYPOINT` inclura des options JVM par défaut optimisées (ex: `-XX:+UseContainerSupport`, `-XX:MaxRAMPercentage=75.0`).
    -   _(Hint: Voir `docs/environnement-vars.md`)_

-   **Coding Standards Notes:**

    -   Utiliser un linter Dockerfile (ex: Hadolint).
    -   Commentaires clairs dans le Dockerfile.
    -   _(Hint: Voir `docs/normes-codage.md`)_

## Tasks / Subtasks

-   [ ] Mettre à jour le fichier `backend/.dockerignore` :

    ```
    # Version Control
    .git
    .gitignore
    .gitattributes

    # IDEs and editors
    .idea/
    .vscode/
    *.swp
    *.swo

    # Build artifacts and Maven wrapper
    target/
    .mvn/
    mvnw
    mvnw.cmd
    pom.xml.tag
    pom.xml.releaseBackup
    pom.xml.versionsBackup
    release.properties

    # Logs
    *.log
    logs/

    # OS generated files
    .DS_Store
    Thumbs.db

    # Secrets or local configuration
    .env
    application-local.properties
    application-dev.yml

    # Other project specific files not needed in the image
    HELP.md
    # README.md # Dé-commenter si le README ne doit pas être dans l'image

    # Docker specific
    # Dockerfile # Dé-commenter si build depuis un parent et que ce Dockerfile doit être ignoré
    ```

-   [ ] S'assurer que le `backend/pom.xml` configure le `spring-boot-maven-plugin` pour les "layered JARs" :
    ```xml
    <project>
        <build>
            <plugins>
                <plugin>
                    <groupId>org.springframework.boot</groupId>
                    <artifactId>spring-boot-maven-plugin</artifactId>
                    <configuration>
                        <layers>
                            <enabled>true</enabled>
                            <includeLayerTools>true</includeLayerTools> </layers>
                    </configuration>
                </plugin>
            </plugins>
        </build>
    </project>
    ```
-   [ ] Créer le fichier `backend/Dockerfile` :

    ```dockerfile
    # Stage 1: Build Stage - Compilation de l'application Java avec Maven
    FROM maven:3.9.8-eclipse-temurin-21@sha256:6847cbbf21e159f97819f18336cf6bbc24a89f9eb6439317520d93f904e9a916 AS builder
    WORKDIR /app

    # Copier pom.xml et télécharger les dépendances pour optimiser le cache Docker.
    COPY pom.xml .
    RUN mvn -B dependency:go-offline

    # Copier le reste du code source.
    COPY src ./src

    # Compiler l'application, générer le JAR et s'assurer que les layers Spring Boot sont activées (via pom.xml).
    RUN mvn -B clean package -Dmaven.test.skip=true -Dmaven.wagon.http.retryHandler.count=3

    # Stage 2: Extractor Stage - Décomposition du JAR en couches
    FROM eclipse-temurin:21-jdk-noble@sha256:92c2f5ad8d51ba7588b0cec663f89a724428f60c2c342a9183908df61903969c AS extractor
    WORKDIR /app
    # Copier le JAR construit depuis le stage précédent
    COPY --from=builder /app/target/*.jar application.jar
    # Extraire les couches du JAR dans des répertoires séparés
    RUN java -Djarmode=layertools -jar application.jar extract

    # Stage 3: Runtime Stage - Environnement d'exécution minimal et sécurisé
    FROM eclipse-temurin:21-jre-noble@sha256:303f85bdba0b770b2b7050af80128ac7175fce37a31f75ef1990a20d12a37cc6

    # Arguments pour la configuration de l'utilisateur, du groupe et des métadonnées de l'image
    ARG APP_USER=appuser
    ARG APP_GROUP=appgroup
    ARG APP_UID=1001 # Valeur par défaut pour l'UID
    ARG APP_GID=1001 # Valeur par défaut pour le GID
    ARG APP_VERSION="unknown"
    ARG GIT_COMMIT="unknown"
    ARG BUILD_DATE="" # Ex: $(date -u +'%Y-%m-%dT%H:%M:%SZ')

    # Création d'un groupe et d'un utilisateur dédiés non-root avec les UID/GID spécifiés.
    # Le '|| true' est une précaution si l'utilisateur/groupe existe déjà (peu probable avec --system dans une image fraîche).
    # Pour une meilleure idempotence, on peut vérifier l'existence avant d'ajouter/modifier.
    # Note: 'groupmod' et 'usermod' sont utilisés comme fallback si l'UID/GID est déjà pris par un utilisateur système.
    #       Dans des images de base minimales, il est plus simple d'assumer que l'UID/GID est libre.
    RUN groupadd --gid ${APP_GID} ${APP_GROUP} || groupmod -o -g ${APP_GID} ${APP_GROUP} && \
        useradd --uid ${APP_UID} --gid ${APP_GROUP} --shell /bin/false --create-home ${APP_USER} || usermod -o -u ${APP_UID} -g ${APP_GROUP} ${APP_USER}

    WORKDIR /app

    # Copier les couches extraites depuis le stage "extractor" avec les bonnes permissions
    COPY --chown=${APP_USER}:${APP_GROUP} --from=extractor /app/dependencies/ ./
    COPY --chown=${APP_USER}:${APP_GROUP} --from=extractor /app/spring-boot-loader/ ./
    COPY --chown=${APP_USER}:${APP_GROUP} --from=extractor /app/snapshot-dependencies/ ./
    COPY --chown=${APP_USER}:${APP_GROUP} --from=extractor /app/application/ ./

    # Labels OCI (Open Container Initiative) pour les métadonnées de l'image
    LABEL org.opencontainers.image.title="blog-backend" \
          org.opencontainers.image.description="Application backend Spring Boot pour le projet Blog." \
          org.opencontainers.image.version="${APP_VERSION}" \
          org.opencontainers.image.source="https://github.com/sebc-dev/blog" \
          org.opencontainers.image.revision="${GIT_COMMIT}" \
          org.opencontainers.image.created="${BUILD_DATE}" \
          org.opencontainers.image.vendor="<Votre Organisation - Placeholder>"

    # Passage à l'utilisateur non-root créé précédemment
    USER ${APP_USER}

    # Port sur lequel l'application Spring Boot écoute (configurable via application.properties ou variable d'environnement)
    EXPOSE 8080

    # Instruction HEALTHCHECK pour surveiller l'état de santé de l'application
    # curl doit être disponible dans l'image de base (eclipse-temurin:21-jre-noble l'inclut)
    HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
      CMD curl -f http://localhost:8080/actuator/health | grep -q '"status":"UP"' || exit 1

    # Commande pour démarrer l'application Spring Boot, utilisant le JarLauncher pour les layered JARs
    # et incluant des options JVM optimisées pour les conteneurs.
    ENTRYPOINT ["java", \
                  "-XX:+UseContainerSupport", \
                  "-XX:MaxRAMPercentage=75.0", \
                  "-XX:+HeapDumpOnOutOfMemoryError", \
                  "-Djava.security.egd=file:/dev/./urandom", \
                  "org.springframework.boot.loader.launch.JarLauncher"]
    ```

-   [ ] Builder l'image Docker localement :
        `docker build \ --build-arg APP_VERSION="0.0.1-snapshot" \ --build-arg GIT_COMMIT=$(git rev-parse --short HEAD) \ --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \ -t blog-backend-test ./backend`
-   [ ] Lancer un conteneur :
        `docker run -d -p 8081:8080 --name blog-backend-app -e SPRING_PROFILES_ACTIVE=docker <autres_env_vars_necessaires> blog-backend-test`
-   [ ] Vérifier les logs (`docker logs blog-backend-app`).
-   [ ] Vérifier l'état de santé (`docker inspect --format='{{json .State.Health}}' blog-backend-app` et accès à `http://localhost:8081/actuator/health`).
-   [ ] (Recommandé) Intégrer Hadolint dans le processus de CI/CD ou en pre-commit hook.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs.

-   **Docker Build & Run:**
    -   Build Docker réussi.
    -   Labels OCI présents sur l'image.
    -   Le conteneur démarre, l'application est saine (HEALTHCHECK).
-   **Manual/CLI Verification:**
    -   `/actuator/health` accessible et UP.
    -   Processus Java s'exécute en tant que `appuser` (ou l'utilisateur configuré).
    -   Labels vérifiables via `docker inspect`.

## Story Wrap Up (Agent Populates After Execution)

-   **Agent Model Used:** Gemini Pro
-   **Completion Notes:**
    -   Images de base épinglées :
        -   Builder: `maven:3.9.8-eclipse-temurin-21@sha256:6847cbbf21e159f97819f18336cf6bbc24a89f9eb6439317520d93f904e9a916`
        -   Extractor: `eclipse-temurin:21-jdk-noble@sha256:92c2f5ad8d51ba7588b0cec663f89a724428f60c2c342a9183908df61903969c`
        -   Runner: `eclipse-temurin:21-jre-noble@sha256:303f85bdba0b770b2b7050af80128ac7175fce37a31f75ef1990a20d12a37cc6`
    -   UID/GID configurables avec valeurs par défaut (`appuser`/`appgroup`, 1001/1001).
    -   "Layered JARs" de Spring Boot activés.
    -   `LABEL org.opencontainers.image.source` utilise `https://github.com/sebc-dev/blog`.
    -   `LABEL org.opencontainers.image.vendor` utilise un placeholder : `<Votre Organisation - Placeholder>`.
-   **Change Log:**
    -   Initial Draft
    -   Révisé avec recommandations du rapport d'analyse (Mai 2025).
    -   Finalisé avec hashes SHA256, confirmation pour layered JARs, UID/GID par défaut et URL du repo.
