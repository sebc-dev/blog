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
      org.opencontainers.image.vendor="Kalifazzia"

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