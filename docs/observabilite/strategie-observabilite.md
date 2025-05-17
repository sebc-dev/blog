# Blog Technique Bilingue - Stratégie d'Observabilité

## 1. Introduction et Objectifs

L'observabilité est essentielle pour assurer la fiabilité, la performance et la maintenabilité du Blog Technique Bilingue. Cette stratégie vise à fournir les moyens de comprendre l'état interne du système à travers ses sorties (logs, métriques, et à terme traces), de diagnostiquer rapidement les problèmes et de prendre des décisions éclairées pour son évolution.

**Objectifs principaux de cette stratégie :**

- **Fiabilité :** Détecter, diagnostiquer et résoudre proactivement les erreurs et les pannes afin de maintenir une haute disponibilité du service.
- **Performance :** Identifier les goulots d'étranglement, surveiller les temps de réponse et optimiser l'utilisation des ressources pour garantir une expérience utilisateur fluide.
- **Débogage :** Fournir des informations détaillées pour faciliter l'analyse des causes racines des incidents et la reproduction des erreurs.
- **Compréhension du Système :** Obtenir des informations sur la manière dont les utilisateurs interagissent avec le blog et comment les différents composants se comportent en conditions réelles.

**Portée :**

- **MVP (Minimum Viable Product) :** Mettre en place les fondations de logging et de monitoring de base pour tous les composants critiques (VPS, Traefik, Nginx pour Astro, Spring Boot Backend, PostgreSQL). L'accent sera mis sur la collecte locale des logs et des métriques essentielles, accessibles manuellement pour le débogage et la surveillance de base.
- **Post-MVP :** Envisager des solutions plus avancées pour l'agrégation centralisée des logs, la visualisation des métriques (dashboards), la mise en place d'alertes proactives et potentiellement le tracing distribué si la complexité du système le justifie.

## 2. Logging

### 2.1. Philosophie de Logging

Une stratégie de logging robuste est fondamentale pour l'observabilité. Notre philosophie repose sur les principes suivants :

- **Exhaustivité Pertinente :** Logger suffisamment d'informations pour comprendre le flux d'exécution, diagnostiquer les erreurs et auditer les actions critiques, sans pour autant noyer les logs sous un volume excessif de détails inutiles en temps normal.
- **Standardisation :** Utiliser des formats de log cohérents et structurés (notamment JSON pour le backend) pour faciliter l'analyse automatisée et la recherche.
- **Niveaux Appropriés :** Employer judicieusement les niveaux de log (DEBUG, INFO, WARN, ERROR) pour permettre un filtrage efficace en fonction des besoins (développement, production, investigation d'incident).
- **Contexte Essentiel :** Inclure des informations contextuelles dans les logs (ex: identifiants de requête, identifiants d'entité concernée) pour faciliter le traçage des opérations à travers les composants et le temps.
- **Sécurité :** Veiller à ne **jamais** logger d'informations sensibles (mots de passe, clés API, données personnelles identifiables) en clair.
- **Performance :** Bien que le logging soit crucial, il doit être implémenté de manière à minimiser l'impact sur les performances de l'application (ex: logging asynchrone si nécessaire et justifié, mais pas prévu pour le MVP).

### 2.2. Stratégies de Logging par Composant

#### 2.2.1. Backend Spring Boot

- **Format :** JSON structuré. Chaque ligne de log sera un objet JSON pour faciliter l'analyse et l'intégration avec des outils de gestion de logs futurs.
  - _Exemple de champs JSON :_ `timestamp`, `level`, `service` (nom de l'application, ex: "blog-backend"), `version` (version de l'application), `thread_name`, `logger_name`, `message`, `stack_trace` (si erreur), et des champs de contexte métier spécifiques (ex: `article_canonical_slug`, `lang`, `user_ip_anonymized` si pertinent et géré correctement).
- **Niveaux de Log (Standard SLF4J/Logback) :**
  - `ERROR` : Erreurs critiques empêchant le fonctionnement normal d'une fonctionnalité. Nécessite une attention immédiate. Inclut les stack traces.
  - `WARN` : Événements inattendus ou problèmes potentiels qui n'empêchent pas encore le fonctionnement mais pourraient le faire. Ex: échec d'une tentative de connexion à un service tiers avant retry, utilisation d'une API dépréciée.
  - `INFO` : Messages informatifs sur le déroulement normal de l'application. Ex: démarrage/arrêt du service, traitement d'une requête API réussie (avec des informations clés comme l'endpoint et le temps de traitement), actions métier significatives.
  - `DEBUG` : Informations détaillées utiles pour le débogage en développement ou lors de l'investigation d'un problème spécifique en production (activable dynamiquement si possible, ou par redémarrage avec un niveau de log ajusté).
  - `TRACE` : Niveau de détail le plus fin, rarement utilisé en production continue.
  - _Politique par défaut en production :_ `INFO`.
  - _Politique par défaut en développement :_ `DEBUG`.
- **Contenu des Logs :**
  - Inclure systématiquement un timestamp précis (avec fuseau horaire UTC).
  - Identifier clairement l'origine du log (classe, méthode).
  - Pour les requêtes API : logguer l'endpoint, la méthode HTTP, le statut de la réponse, le temps de traitement. Ne **pas** logguer les body de requête/réponse s'ils contiennent des données sensibles. Pour le MVP, nos DTOs ne contiennent pas d'informations sensibles, mais c'est une règle générale importante.
  - Pour les erreurs : logguer le message d'erreur complet et la stack trace.
  - **Correlation ID :** Envisager (Post-MVP ou si jugé nécessaire rapidement) d'introduire un ID de corrélation (par ex. via `MDC` de SLF4J) pour suivre une requête à travers différents appels de service ou logs. Pour le MVP, le contexte se limite à une seule interaction API.
- **Outil :** **SLF4J** comme façade de logging, avec **Logback** comme implémentation par défaut (fourni par Spring Boot). La configuration se fera via `logback-spring.xml`.

#### 2.2.2. Frontend Astro (via Nginx)

Le frontend étant constitué de fichiers statiques générés par Astro, le logging à ce niveau concernera principalement le serveur web (Nginx) qui sert ces fichiers.

- **Format :**
  - **Logs d'accès Nginx :** Format standard combiné (ou un format personnalisé incluant des informations utiles comme le temps de réponse). Exemple : `'$remote_addr - $remote_user [$time_local] "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent" "$request_time"'`.
  - **Logs d'erreur Nginx :** Format d'erreur standard de Nginx.
- **Niveaux de Log (pour les erreurs Nginx) :** Les niveaux standards de Nginx (`error`, `warn`, `info`, `debug`) seront utilisés. Le niveau par défaut en production sera `error` ou `warn` pour ne capturer que les problèmes significatifs.
- **Informations Capturées (Logs d'accès) :**
  - Adresse IP source de la requête (`$remote_addr`).
  - Timestamp de la requête (`$time_local`).
  - Méthode HTTP, URI et protocole (`"$request"`).
  - Code de statut HTTP de la réponse (`$status`).
  - Taille du corps de la réponse en octets (`$body_bytes_sent`).
  - Référent (`"$http_referer"`).
  - User-Agent du client (`"$http_user_agent"`).
  - Temps de traitement de la requête par Nginx (`"$request_time"`).
- **Contenu des Logs (Logs d'erreur) :** Erreurs rencontrées par Nginx lors du traitement des requêtes (ex: fichier non trouvé si une ressource est mal liée, problèmes de permission, etc.).
- **Outil :** **Nginx**. La configuration des logs se fera dans le fichier `nginx.conf` du conteneur Docker servant le site Astro.
- **Logging Côté Client (Navigateur - Post-MVP) :** Pour le MVP, aucun log spécifique n'est collecté directement depuis le code JavaScript exécuté dans le navigateur de l'utilisateur. Post-MVP, des erreurs JavaScript non capturées pourraient être envoyées à un service de collecte d'erreurs (ex: Sentry, LogRocket) si le besoin se fait sentir, en particulier si des composants interactifs plus complexes sont ajoutés.

#### 2.2.3. Traefik Reverse Proxy

Traefik, en tant que point d'entrée de toutes les requêtes HTTP/HTTPS, génère des logs précieux pour comprendre le trafic et diagnostiquer les problèmes de routage ou de certificat.

- **Format :**
  - **Logs d'accès :** Traefik supporte plusieurs formats pour les logs d'accès (par défaut : Common Log Format - CLF). Il est recommandé d'utiliser un format JSON structuré si disponible et facile à configurer, ou a minima un format enrichi incluant le temps de réponse, le nom du service backend, et l'état du frontend/router.
    - _Exemple de configuration (à adapter via les arguments de commande Docker) pour un format JSON :_
      ```yaml
      # Dans docker-compose.yml, sous la clé `command:` du service traefik
      - "--accesslog=true"
      - "--accesslog.format=json" # Ou "common"
      # - "--accesslog.filePath=/logs/traefik-access.log" # Si non redirigé vers stdout
      # - "--accesslog.bufferingsize=100" # Optionnel
      # - "--accesslog.fields.defaultmode=keep" # ou "drop"
      # - "--accesslog.fields.names.ClientHost=keep"
      # - "--accesslog.fields.names.RequestMethod=keep"
      # - "--accesslog.fields.names.RequestPath=keep"
      # ... autres champs selon besoin
      ```
  - **Logs d'application/Traefik :** Logs produits par Traefik lui-même concernant son fonctionnement interne, la découverte de services, la gestion des certificats Let's Encrypt, etc. Ces logs sont généralement textuels.
- **Niveaux de Log (pour les logs d'application Traefik) :** `ERROR`, `WARN`, `INFO`, `DEBUG`. Le niveau par défaut en production sera `INFO` ou `WARN`.
  - _Configuration (arguments de commande Docker) :_
    ```yaml
    # Dans docker-compose.yml, sous la clé `command:` du service traefik
    - "--log.level=INFO" # (ex: DEBUG, INFO, WARN, ERROR)
    # - "--log.filepath=/logs/traefik.log" # Si non redirigé vers stdout
    - "--log.format=json" # ou "common" (text)
    ```
- **Informations Capturées (Logs d'accès - dépend du format choisi) :**
  - Timestamp.
  - IP du client.
  - Méthode HTTP, URL demandée, protocole.
  - Code de statut HTTP.
  - Taille de la réponse.
  - Référent, User-Agent.
  - Durée de la requête.
  - Nom du routeur et du service Traefik ayant traité la requête.
  - URL du backend.
- **Contenu des Logs (Logs d'application Traefik) :**
  - Démarrage et arrêt de Traefik.
  - Détection des conteneurs et création/mise à jour des routes.
  - Erreurs de configuration.
  - Processus de génération et de renouvellement des certificats SSL/TLS (Let's Encrypt).
  - Problèmes de communication avec les backends.
- **Outil :** **Traefik**. Les logs seront configurés pour être écrits sur `stdout`/`stderr` afin d'être capturés par le système de logging de Docker, ou dans des fichiers spécifiés si une gestion de fichiers dédiée est préférée (moins courant avec Docker).

#### 2.2.4. Base de Données PostgreSQL

La journalisation de la base de données PostgreSQL est cruciale pour le suivi des performances, la détection d'erreurs et l'audit.

- **Format :** Format texte standard de PostgreSQL. Les messages de log incluent typiquement un timestamp, l'ID du processus, le niveau de log, et le message d'erreur ou d'information.
- **Niveaux de Log (Configuration PostgreSQL via `postgresql.conf`) :**
  - `log_statement`: Contrôle quelles instructions SQL sont journalisées. Pour le MVP, nous pourrions le régler sur `ddl` pour journaliser toutes les instructions de définition de données (CREATE, ALTER, DROP), ou `mod` pour journaliser DDL et les instructions de modification de données (INSERT, UPDATE, DELETE). `all` est trop verbeux pour la production continue. `none` est le défaut.
    - _Recommandation MVP :_ `ddl` ou `mod` si le volume de logs reste gérable.
  - `log_duration`: Journalise la durée de chaque instruction complétée. Utile pour identifier les requêtes lentes. Désactivé par défaut.
    - _Recommandation MVP :_ Peut être activé temporairement pour le débogage de performance.
  - `log_min_duration_statement`: Ne journalise les instructions que si leur exécution dépasse le temps spécifié (en millisecondes). Une valeur de `1000` (1 seconde) peut être un bon point de départ pour identifier les requêtes particulièrement lentes sans surcharger les logs.
    - _Recommandation MVP :_ Configurer à une valeur raisonnable (ex: `500ms` ou `1000ms`).
  - `log_connections` / `log_disconnections`: Journalise les tentatives de connexion et les déconnexions. Utile pour l'audit et le diagnostic des problèmes de connexion.
    - _Recommandation MVP :_ Activer (`on`).
  - `log_lock_waits`: Journalise les attentes de verrouillage prolongées.
    - _Recommandation MVP :_ Activer (`on`), surtout si des problèmes de concurrence sont suspectés.
  - `log_error_verbosity`: Contrôle la quantité de détails écrits dans les logs du serveur pour chaque message journalisé (TERSE, DEFAULT, VERBOSE).
    - _Recommandation MVP :_ `DEFAULT`.
  - `client_min_messages`: Niveau de message envoyé au client (par opposition aux logs serveur).
    - _Recommandation MVP :_ `NOTICE` ou `WARNING`.
  - _Niveau de log serveur global (dans `postgresql.conf`) :_ `log_min_messages` devrait être à `WARNING` ou `ERROR` en production pour éviter la verbosité excessive.
- **Informations Capturées (selon configuration) :**
  - Timestamps des événements.
  - Erreurs SQL, avertissements.
  - Tentatives de connexion (succès/échec).
  - Requêtes lentes (si `log_min_duration_statement` est configuré).
  - Instructions DDL/DML (si `log_statement` est configuré).
  - Blocages (deadlocks).
- **Outil :** **PostgreSQL** lui-même. Les logs sont écrits dans le répertoire de données de PostgreSQL (par exemple, `/var/log/postgresql/` si installé directement, ou dans le volume persistant du conteneur Docker si configuré pour écrire dans des fichiers). Idéalement, le conteneur PostgreSQL sera configuré pour envoyer ses logs vers `stdout`/`stderr` afin qu'ils soient capturés par Docker.
- **Rotation et Rétention :**
  - Si PostgreSQL est configuré pour écrire dans des fichiers logs (plutôt que `stdout`/`stderr` pour Docker), la rotation des logs (`log_rotation_age`, `log_rotation_size`) et la gestion des anciens fichiers (`log_truncate_on_rotation`, `log_filename`) devront être configurées dans `postgresql.conf`.
  - Pour le MVP, en s'appuyant sur les logs Docker vers `stdout`/`stderr`, la rotation sera gérée par la configuration du démon Docker (voir section `2.2.5` et `2.4`).
  - La sauvegarde des données de la base est gérée par OVH, mais cela ne couvre pas nécessairement les logs à long terme pour l'analyse forensique, sauf s'ils sont inclus dans les snapshots du système de fichiers et que ces snapshots sont conservés.

#### 2.2.5. Logs des Conteneurs Docker

La stratégie principale pour la journalisation des applications conteneurisées (Spring Boot, Nginx pour Astro, PostgreSQL, Traefik) est de configurer les applications pour qu'elles écrivent leurs logs sur la **sortie standard (`stdout`)** et l'**erreur standard (`stderr`)**.

- **Collecte :**
  - Le démon Docker capture automatiquement les flux `stdout` et `stderr` de chaque conteneur.
  - Ces logs peuvent être consultés via la commande `docker logs <container_id_ou_nom>`.
- **Driver de Logging Docker :**
  - Par défaut, Docker utilise le driver `json-file` qui stocke les logs dans des fichiers JSON sur l'hôte Docker.
  - Ce driver est suffisant pour le MVP.
  - _Emplacement par défaut des logs sur l'hôte (Debian) :_ `/var/lib/docker/containers/<container_id>/<container_id>-json.log`.
- **Rotation et Rétention (via la configuration du démon Docker) :**
  - Pour éviter que les logs des conteneurs ne saturent l'espace disque du VPS, il est crucial de configurer la rotation des logs au niveau du démon Docker. Cela peut être fait globalement dans le fichier de configuration du démon Docker (`/etc/docker/daemon.json`) ou par conteneur dans le fichier `docker-compose.yml`.
  - _Exemple de configuration dans `daemon.json` (recommandé pour une politique globale) :_
    ```json
    {
      "log-driver": "json-file",
      "log-opts": {
        "max-size": "10m",
        "max-file": "3"
      }
    }
    ```
    Ceci configure Docker pour conserver au maximum 3 fichiers de log de 10MB chacun par conteneur. Les logs plus anciens sont supprimés.
  - _Exemple de configuration par service dans `docker-compose.yml` (si une configuration plus fine est nécessaire) :_
    ```yaml
    # version: '3.8' # ou plus récent
    # services:
    #   backend:
    #     image: blog-backend-image
    #     logging:
    #       driver: "json-file"
    #       options:
    #         max-size: "5m"
    #         max-file: "2"
    #     ...
    ```
  - **Politique MVP :** Configurer la rotation globalement via `daemon.json` pour assurer une gestion de base de l'espace disque.
- **Accès en Production (MVP) :**
  - L'accès aux logs pour le diagnostic se fera manuellement en se connectant au VPS via SSH et en utilisant les commandes `docker logs`.
  - Des alias ou des scripts simples pourront être mis en place pour faciliter l'accès aux logs des conteneurs les plus consultés.

### 2.3. Agrégation et Stockage des Logs

- **MVP :**
  - Pour le MVP, il n'y aura **pas de système d'agrégation de logs centralisé** déployé.
  - Les logs seront stockés localement sur le VPS, dans les fichiers gérés par le driver de logging Docker (`json-file`) pour chaque conteneur, ou dans les fichiers de logs spécifiques pour les services non conteneurisés (si applicable, mais tous les composants principaux sont prévus en conteneurs).
  - L'accès se fera par connexion SSH au VPS et consultation directe des fichiers ou via `docker logs`.
  - Cette approche est simple et minimise les coûts initiaux et la complexité.
- **Post-MVP / Évolutions Futures :**
  - Si le volume de logs devient important ou si une analyse plus complexe est requise, une solution d'agrégation centralisée sera envisagée.
  - _Options possibles :_
    - **Stack ELK/EFK :** Elasticsearch, Logstash/Fluentd, Kibana. Solution open-source puissante mais plus complexe à gérer.
    - **Loki avec Grafana :** Solution plus légère, bien intégrée avec Prometheus pour les métriques.
    - **Services Cloud :** AWS CloudWatch Logs, Google Cloud Logging, Azure Monitor Logs, ou des services SaaS comme Datadog, Logz.io, Sematext. Ces options ont un coût mais simplifient la gestion.
  - Le choix d'une solution post-MVP dépendra des besoins spécifiques, du budget, et de la charge opérationnelle acceptable.

### 2.4. Rotation et Rétention des Logs

La gestion de la rotation et de la rétention est cruciale pour éviter la saturation de l'espace disque sur le VPS.

- **Logs des Conteneurs Docker (via `daemon.json`) :**
  - Comme mentionné dans la section `2.2.5`, la rotation des logs pour tous les conteneurs sera gérée globalement par la configuration du démon Docker.
  - _Politique MVP :_
    - `max-size`: "10m" (chaque fichier de log ne dépassera pas 10MB)
    - `max-file`: "3" (Docker conservera au maximum 3 fichiers de log par conteneur)
  - Cela signifie qu'un maximum de 30MB de logs sera conservé par conteneur. Pour les 4 conteneurs principaux (Nginx, Spring Boot, PostgreSQL, Traefik), cela représente environ 120MB au total, ce qui est gérable sur un VPS standard.
  - Cette politique assure une rétention des logs récents sur une période glissante. La durée exacte de rétention dépendra du volume de logs généré par chaque application.
- **Logs PostgreSQL (si écriture directe en fichiers et non `stdout`/`stderr`) :**
  - Si PostgreSQL est configuré pour écrire dans des fichiers spécifiques (non recommandé avec Docker où `stdout`/`stderr` est préférable), les paramètres `log_rotation_age`, `log_rotation_size`, `log_truncate_on_rotation` dans `postgresql.conf` devront être ajustés pour correspondre à une politique de rétention similaire ou complémentaire.
  - Pour le MVP, en privilégiant les logs Docker via `stdout`/`stderr`, cette configuration PostgreSQL spécifique est secondaire.
- **Logs Système du VPS (ex: `/var/log`) :**
  - Les logs système standards de Debian (syslog, auth.log, etc.) sont généralement gérés par `logrotate`.
  - La configuration par défaut de `logrotate` sur Debian est souvent adéquate (rotation quotidienne, hebdomadaire, compression, nombre de fichiers conservés).
  - Vérifier la configuration existante de `logrotate` sur le VPS pour s'assurer qu'elle est raisonnable.
- **Sauvegardes OVH :**
  - Les sauvegardes quotidiennes du VPS par OVH incluent le système de fichiers. Si les logs Docker sont stockés dans `/var/lib/docker/containers/`, ils seront inclus dans ces sauvegardes.
  - Cependant, ces sauvegardes ne sont pas conçues pour une recherche et une analyse de logs aisées. Elles servent plutôt à une restauration complète en cas de sinistre. La politique de rétention de ces sauvegardes OVH déterminera la durée maximale de conservation "accidentelle" de ces fichiers de logs.
- **Revue et Ajustement :**
  - La politique de rotation et de rétention devra être revue périodiquement (ex: tous les 6 mois) en fonction du volume de logs réellement généré et des besoins de diagnostic.

## 3. Monitoring

Le monitoring est le processus de collecte, de traitement, d'agrégation et d'affichage de données quantitatives en temps réel sur un système, telles que les taux de requêtes, les taux d'erreur, les temps de latence, et l'utilisation des ressources. Il complète le logging en fournissant une vue agrégée de la santé et de la performance du système.

### 3.1. Philosophie de Monitoring

Notre approche du monitoring repose sur les principes suivants :

- **Couverture Complète :** Surveiller tous les composants critiques de l'infrastructure et de l'application (VPS, reverse proxy, serveur web frontend, API backend, base de données).
- **Métriques Clés (Golden Signals) :** Se concentrer sur les métriques qui fournissent le plus d'informations sur la santé du système et l'expérience utilisateur. Pour les services, cela inclut souvent :
  - **Latence :** Le temps nécessaire pour servir une requête.
  - **Trafic :** La demande sur le système (ex: requêtes par seconde).
  - **Erreurs :** Le taux de requêtes qui échouent.
  - **Saturation :** À quel point le système est "plein" (ex: utilisation CPU, mémoire, disque).
- **Accessibilité :** Les données de monitoring doivent être facilement accessibles pour le diagnostic et l'analyse, en particulier pendant les incidents.
- **Actionnable :** Les métriques doivent aider à prendre des décisions, que ce soit pour le dépannage, la planification de capacité, ou l'amélioration des performances.
- **Granularité Appropriée :** Collecter des données à une granularité qui permet de détecter les problèmes sans surcharger le système de collecte ou de stockage.
- **Simplicité pour le MVP :** Commencer avec des outils et des méthodes simples, accessibles directement sur le VPS, et évoluer vers des solutions plus sophistiquées (dashboards centralisés) post-MVP.

### 3.2. Métriques Système du VPS

La surveillance de l'état de santé et de l'utilisation des ressources du VPS hébergeant nos conteneurs Docker est la première ligne de défense pour assurer la stabilité de l'application.

- **Outils (pour le MVP - accès direct via SSH) :**
  - Commandes Linux standard :
    - `htop` ou `top` : Pour une vue en temps réel de l'utilisation du CPU, de la mémoire et des processus en cours.
    - `vmstat` : Fournit des informations sur les processus, la mémoire, le paging, les entrées/sorties de bloc, les interruptions, et l'activité CPU.
    - `df -h` : Pour surveiller l'utilisation de l'espace disque.
    - `iostat` : Pour les statistiques d'utilisation du CPU et les statistiques d'entrée/sortie pour les périphériques de bloc.
    - `free -m` : Pour afficher la quantité de mémoire libre et utilisée dans le système.
    - `netstat` ou `ss` : Pour surveiller les connexions réseau et les ports ouverts.
  - Scripts Shell personnalisés : Des scripts simples pourraient être mis en place pour collecter périodiquement des métriques clés et les enregistrer dans un fichier, ou pour vérifier certains seuils (approche très basique pour le MVP si nécessaire).
  - Agent de monitoring OVH (si disponible et pertinent) : Vérifier si OVH fournit un tableau de bord de base ou un agent léger pour le monitoring des ressources du VPS.
- **Métriques Clés à Surveiller :**
  - **Utilisation du CPU :**
    - Pourcentage d'utilisation globale du CPU.
    - Charge moyenne (load average sur 1, 5, 15 minutes) : Indique la demande sur le CPU. Des valeurs constamment supérieures au nombre de cœurs CPU peuvent indiquer une surcharge.
    - Temps d'attente I/O (CPU iowait) : Un pourcentage élevé peut indiquer un goulot d'étranglement au niveau des disques.
  - **Utilisation de la Mémoire :**
    - Mémoire totale, utilisée, libre, disponible.
    - Utilisation du SWAP : Une utilisation excessive et constante du SWAP indique un manque de RAM.
  - **Utilisation du Disque :**
    - Espace disque total, utilisé, libre pour les partitions critiques (ex: `/`, `/var/lib/docker`).
    - Activité I/O du disque (taux de lecture/écriture, temps d'attente).
  - **Utilisation du Réseau :**
    - Trafic entrant et sortant (octets/paquets par seconde).
    - Nombre de connexions établies.
    - Erreurs réseau (si disponibles).
  - **Nombre de Processus / Threads :**
    - Surveiller une augmentation anormale du nombre de processus.
- **Accès et Fréquence (MVP) :**
  - Vérification manuelle via SSH en cas de suspicion de problème ou périodiquement (ex: quotidiennement au début, puis hebdomadairement).
  - Aucun système d'alerte automatisé pour ces métriques système n'est prévu pour le MVP, sauf si fourni nativement par OVH.

### 3.3. Métriques Applicatives

En plus des métriques système du VPS, il est crucial de surveiller la performance et la santé des applications elles-mêmes.

#### 3.3.1. Backend Spring Boot

L'API backend Spring Boot est un composant critique pour les fonctionnalités dynamiques du MVP.

- **Outil :**
  - **Spring Boot Actuator :** Fournit des endpoints HTTP prêts à l'emploi pour exposer des informations sur l'application, y compris des métriques, la santé, les informations de l'application, etc.
    - Endpoint principal pour les métriques : `/actuator/metrics` (fournit une liste des noms de métriques disponibles).
    - Pour obtenir la valeur d'une métrique spécifique : `/actuator/metrics/{metric.name}`.
    - Endpoint de santé : `/actuator/health` (fournit un état de santé global et des détails sur les composants, ex: base de données, espace disque).
  - Ces endpoints Actuator seront exposés par l'application Spring Boot mais **ne seront pas routés publiquement par Traefik**. L'accès se fera soit par `docker exec` dans le conteneur, soit en exposant temporairement le port de l'actuator sur une interface locale du VPS pour un accès via SSH tunneling si nécessaire pour le débogage. La sécurisation des endpoints Actuator (même non exposés publiquement) est une bonne pratique (ex: via Spring Security si une exposition plus large était envisagée post-MVP).
- **Métriques Clés à Surveiller (via Actuator) :**
  - **Requêtes HTTP :**
    - `http.server.requests.count` : Nombre total de requêtes reçues.
    - `http.server.requests.active` : Nombre de requêtes actives.
    - `http.server.requests.duration` (ou `timer`) : Distribution des temps de réponse des requêtes (count, sum, max, et potentiellement des percentiles comme p95, p99 si Micrometer est configuré avec un backend de métriques supportant cela).
    - Filtrage par statut HTTP (ex: nombre de requêtes 2xx, 4xx, 5xx), par URI, par méthode.
  - **Performance JVM :**
    - `jvm.memory.used` / `jvm.memory.committed` / `jvm.memory.max` : Utilisation de la mémoire heap et non-heap.
    - `jvm.gc.pause` : Durée et fréquence des pauses de Garbage Collection.
    - `jvm.threads.live` / `jvm.threads.peak` : Nombre de threads.
    - `system.cpu.usage` / `process.cpu.usage` : Utilisation du CPU par la JVM.
  - **Pool de Connexions à la Base de Données (si HikariCP est utilisé, ce qui est le cas par défaut avec Spring Boot JPA) :**
    - `hikaricp.connections.active` : Nombre de connexions actives.
    - `hikaricp.connections.idle` : Nombre de connexions inactives.
    - `hikaricp.connections.pending` : Nombre de threads en attente d'une connexion.
    - `hikaricp.connections.usage` : Temps d'utilisation des connexions.
    - `hikaricp.connections.creation` : Temps de création des connexions.
  - **Logs (via Logback) :**
    - `logback.events.count` : Nombre d'événements de log par niveau (ERROR, WARN, INFO, DEBUG, TRACE). Particulièrement utile pour surveiller le taux d'erreurs.
  - **Santé de l'Application (via `/actuator/health`) :**
    - Statut global (`UP`, `DOWN`, `OUT_OF_SERVICE`).
    - Détails des composants de santé (ex: `db` pour la base de données, `diskSpace`).
- **Accès et Fréquence (MVP) :**
  - Consultation manuelle des endpoints Actuator via `curl` depuis le VPS (ex: `curl http://localhost:8080/actuator/metrics/http.server.requests.count`) ou via SSH tunneling pour un accès navigateur.
  - Les indicateurs de santé (`/actuator/health`) peuvent être vérifiés lors des déploiements ou en cas de suspicion de problème.

#### 3.3.2. Frontend (via Nginx/Traefik)

Le frontend généré par Astro est servi comme un ensemble de fichiers statiques par Nginx, lui-même derrière Traefik. Les métriques applicatives directes sont donc limitées, mais nous pouvons déduire son comportement et sa performance à travers les métriques de Nginx et Traefik.

- **Outils :**
  - **Logs d'accès Nginx et Traefik :** Analysés (manuellement pour le MVP) pour extraire des tendances.
  - **Métriques exposées par Traefik (Post-MVP) :** Traefik peut être configuré pour exposer des métriques au format Prometheus. Bien que l'intégration d'un stack Prometheus/Grafana soit post-MVP, la disponibilité de ces métriques est un avantage.
  - **Google Analytics :** Bien que principalement un outil d'analyse d'audience, certaines données (temps de chargement des pages côté client, erreurs JavaScript si configuré) peuvent donner des indications sur la performance perçue du frontend. (Voir PRD `Epic 5: SEO de Base et Analyse`).
- **Métriques Clés à Surveiller (déduites des logs d'accès Nginx/Traefik pour le MVP) :**
  - **Volume de Requêtes :**
    - Nombre total de requêtes HTTP vers les ressources du frontend.
    - Requêtes par seconde (RPS) ou par minute pour identifier les pics de trafic.
  - **Taux de Réponse d'Erreur :**
    - Pourcentage de réponses HTTP `4xx` (ex: `404 Not Found` pour des ressources manquantes).
    - Pourcentage de réponses HTTP `5xx` (indiquant des problèmes côté Nginx ou Traefik, bien que moins probables pour des fichiers statiques, cela pourrait arriver en cas de mauvaise configuration ou de problème d'infrastructure).
  - **Volume de Trafic :**
    - Quantité de données transférées (ex: en MB ou GB par jour) pour les ressources du frontend.
  - **Pages les Plus Consultées :**
    - Identifier les URLs les plus demandées peut aider à comprendre quels contenus sont populaires.
  - **Temps de Réponse (Nginx/Traefik) :**
    - Le temps de réponse enregistré dans les logs d'accès de Nginx (`$request_time`) et de Traefik (`Duration`) donne une indication de la performance du service de fichiers statiques et du proxy. Des augmentations inhabituelles pourraient indiquer une surcharge du serveur ou des problèmes réseau sur le VPS.
- **Accès et Fréquence (MVP) :**
  - Analyse manuelle des logs d'accès de Nginx et Traefik en cas de problème ou pour des revues périodiques.
  - Consultation des rapports Google Analytics pour les aspects liés à la performance perçue par l'utilisateur et les erreurs JavaScript (si configuré).

#### 3.3.3. Base de Données PostgreSQL

La base de données PostgreSQL est un composant d'état critique. Son monitoring aide à prévenir la perte de données, à assurer des performances optimales des requêtes et à maintenir la disponibilité.

- **Outils (pour le MVP - accès direct via SSH et psql) :**
  - Commandes `psql` :
    - Connexion à la base de données via `psql` pour exécuter des requêtes de diagnostic.
    - Utilisation des vues système de PostgreSQL (catalogue `pg_catalog`) et des fonctions pour obtenir des informations sur l'état de la base. Par exemple :
      - `\conninfo` : Affiche les informations sur la connexion actuelle.
      - `\l` : Liste les bases de données.
      - `\dt+` : Liste les tables avec leur taille.
      - `\di+` : Liste les index avec leur taille.
      - `SELECT * FROM pg_stat_activity;` : Affiche les connexions actives et leurs requêtes en cours.
      - `SELECT * FROM pg_locks;` : Affiche les verrous actifs.
      - `SELECT * FROM pg_stat_database;` : Statistiques par base de données (transactions, blocs lus, etc.).
      - `SELECT * FROM pg_stat_user_tables;` : Statistiques d'accès aux tables (scans séquentiels, scans d'index, tuples insérés/mis à jour/supprimés).
  - Logs PostgreSQL : Comme détaillé dans la section `2.2.4`, les logs PostgreSQL (requêtes lentes, erreurs, connexions) sont une source clé d'information pour le monitoring.
  - Commandes système du VPS : Les outils comme `htop`, `iostat` sur le VPS peuvent aussi aider à corréler la charge de la base de données avec l'utilisation des ressources système (CPU, mémoire, I/O disque) par le processus PostgreSQL.
- **Métriques Clés à Surveiller :**
  - **Connexions :**
    - Nombre de connexions actives (`pg_stat_activity`).
    - Nombre de connexions inactives ou en attente.
    - Atteinte de la limite `max_connections`.
  - **Performance des Requêtes :**
    - Identification des requêtes lentes (via `log_min_duration_statement` dans les logs ou des vues comme `pg_stat_statements` si l'extension est activée post-MVP).
    - Utilisation des index (ex: scans d'index vs scans séquentiels via `pg_stat_user_tables`).
  - **Transactions :**
    - Nombre de commits et de rollbacks (`pg_stat_database`).
    - Âge de la transaction la plus ancienne (important pour éviter le "transaction ID wraparound").
  - **Utilisation du Disque :**
    - Taille de la base de données et des tables/index individuels.
    - Taux de croissance.
  - **Performance des Sauvegardes et de la Réplication (si applicable post-MVP) :**
    - Pour le MVP, les sauvegardes sont gérées par OVH.
  - **Taux de Cache Hit :**
    - Efficacité du cache partagé de PostgreSQL pour les blocs de données et les index. (Peut être estimé via `pg_statio_user_tables`, `pg_statio_user_indexes`).
  - **Verrous et Blocages (Deadlocks) :**
    - Surveillance des verrous excessifs ou des deadlocks (`pg_locks`, logs).
- **Accès et Fréquence (MVP) :**
  - Vérification manuelle via `psql` et analyse des logs en cas de suspicion de lenteur de l'API backend, d'erreurs, ou pour des contrôles de santé périodiques.
  - Aucun dashboard ou alerte automatisée pour ces métriques n'est prévu pour le MVP.

#### 3.3.4. Santé des Conteneurs Docker

En plus des métriques internes des applications, il est important de surveiller la santé et la consommation de ressources des conteneurs Docker eux-mêmes.

- **Outils (pour le MVP - accès direct via SSH) :**
  - **Commandes Docker :**
    - `docker ps -a` : Liste tous les conteneurs et leur statut (ex: `Up`, `Exited`, `Restarting`). Permet de vérifier rapidement si tous les conteneurs attendus sont en cours d'exécution.
    - `docker stats $(docker ps -q)` : Fournit un flux en direct de l'utilisation des ressources (CPU, mémoire, I/O réseau, I/O disque) pour tous les conteneurs en cours d'exécution. Très utile pour identifier un conteneur qui consommerait anormalement des ressources.
    - `docker inspect <container_id_ou_nom>` : Fournit des informations détaillées sur la configuration d'un conteneur, y compris son état, ses redémarrages, etc.
    - `docker events` : Affiche les événements Docker en temps réel (création, démarrage, arrêt, mort d'un conteneur).
  - **Logs des conteneurs :** Comme mentionné dans la section `2.2.5`, les logs capturés par Docker (`docker logs ...`) sont essentiels pour comprendre pourquoi un conteneur pourrait être en mauvaise santé ou redémarrer.
- **Métriques Clés à Surveiller :**
  - **Statut du Conteneur :**
    - Vérifier que les conteneurs critiques (Nginx, Spring Boot, PostgreSQL, Traefik) sont bien à l'état `Up`.
    - Surveiller les redémarrages fréquents (`Restart Count` dans `docker inspect` ou via des outils post-MVP) qui peuvent indiquer des problèmes persistants.
  - **Consommation de Ressources par Conteneur (via `docker stats`) :**
    - Utilisation CPU par conteneur.
    - Utilisation mémoire par conteneur (et si elle approche des limites configurées pour le conteneur, si des limites sont définies).
    - Activité réseau (entrée/sortie) par conteneur.
    - Activité disque (lecture/écriture) par conteneur.
  - **Health Checks Docker (Optionnel pour MVP, mais recommandé) :**
    - Docker permet de définir un `HEALTHCHECK` dans le `Dockerfile` ou dans `docker-compose.yml`. Docker exécutera périodiquement cette commande à l'intérieur du conteneur pour déterminer son état de santé (ex: `healthy`, `unhealthy`).
    - _Exemple pour Spring Boot (via endpoint Actuator) dans `docker-compose.yml` :_
      ```yaml
      # services:
      #   backend:
      #     image: blog-backend-image
      #     healthcheck:
      #       test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      #       interval: 30s
      #       timeout: 10s
      #       retries: 3
      #       start_period: 60s # Laisse le temps à l'application de démarrer
      #     ...
      ```
    - _Exemple pour Nginx :_
      ```yaml
      # services:
      #   frontend:
      #     image: blog-frontend-image
      #     healthcheck:
      #       test: ["CMD", "curl", "-f", "http://localhost/health_check.html"] # Nécessite un fichier health_check.html servi par Nginx
      #       interval: 30s
      #       timeout: 5s
      #       retries: 3
      #     ...
      ```
    - Le statut du health check est visible via `docker ps` et `docker inspect`.
    - **Politique MVP :** Implémenter les health checks Docker de base pour les services Spring Boot et Nginx est une bonne pratique à considérer même pour le MVP car cela aide Docker à mieux gérer les conteneurs (ex: ne pas router le trafic vers un conteneur `unhealthy` si utilisé avec un orchestrateur, ou faciliter le diagnostic).
- **Accès et Fréquence (MVP) :**
  - Vérification manuelle via les commandes `docker` en cas de suspicion de problème ou lors des déploiements.
  - L'implémentation des `HEALTHCHECK` Docker fournit un indicateur de santé directement dans la sortie de `docker ps`.
- **Post-MVP :**
  - Des outils comme **cAdvisor (Container Advisor)** de Google peuvent collecter, agréger, traiter et exporter des informations sur les conteneurs en cours d'exécution. cAdvisor s'intègre bien avec Prometheus.
  - Les orchestrateurs comme Kubernetes fournissent des mécanismes de surveillance de la santé des pods (équivalents des conteneurs) beaucoup plus avancés.

### 3.4. Visualisation des Métriques

Pour le MVP, la visualisation des métriques sera rudimentaire et basée sur l'accès direct aux outils et commandes.

- **MVP :**
  - **Aucun dashboard centralisé :** Pas de mise en place d'outils comme Grafana, Kibana, ou des dashboards cloud pour le MVP afin de limiter la complexité et les coûts.
  - **Visualisation Ad Hoc :**
    - Métriques système VPS : Via les commandes Linux (`htop`, `vmstat`, `iostat`, `df`, `docker stats`) directement sur le serveur.
    - Métriques Spring Boot Actuator : Via `curl` ou accès navigateur (avec SSH tunneling) aux endpoints JSON. L'interprétation des données JSON sera manuelle.
    - Métriques PostgreSQL : Via les commandes `psql` et l'analyse des vues système.
    - Logs : Consultation directe des fichiers de logs ou via `docker logs`.
  - Cette approche demande une action manuelle pour collecter et interpréter les données, mais elle est suffisante pour les besoins de diagnostic de base du MVP.
- **Post-MVP / Évolutions Futures :**
  - La mise en place d'une solution de visualisation centralisée sera une priorité si le besoin d'analyse proactive, de corrélation de données, ou de partage d'informations sur la santé du système augmente.
  - _Options possibles :_
    - **Grafana :** Outil open-source populaire pour la création de dashboards. Peut se connecter à diverses sources de données :
      - **Prometheus :** Pour les métriques système (via `node_exporter`), les métriques Docker/cAdvisor, les métriques Traefik, les métriques Spring Boot (via l'endpoint Prometheus d'Actuator), et les métriques PostgreSQL (via `pg_exporter`).
      - **Loki :** Pour visualiser les logs (alternative à ELK).
      - **Elasticsearch :** Pour visualiser les logs si la stack ELK est choisie.
    - **Kibana :** Si la stack ELK est retenue pour les logs.
    - **Solutions SaaS :** Datadog, New Relic, Dynatrace, etc., offrent des solutions complètes d'APM (Application Performance Monitoring) incluant logging, métriques, et tracing avec des dashboards prêts à l'emploi, mais avec un coût associé.
  - Le choix dépendra de l'évolution des besoins, du budget, et des compétences de l'équipe. Un stack Prometheus + Grafana est une option open-source courante et puissante pour commencer.

## 4. Alerting (Post-MVP)

**Statut : Post-MVP**

L'alerting est le mécanisme qui notifie l'équipe lorsque le système atteint des seuils critiques prédéfinis ou rencontre des erreurs significatives, permettant une intervention rapide avant qu'un problème n'impacte gravement les utilisateurs.

### 4.1. Philosophie d'Alerting (Post-MVP)

- **Pertinence :** Les alertes doivent être significatives, actionnables et indiquer un problème réel ou imminent. Éviter la fatigue due à un excès d'alertes non pertinentes.
- **Rapidité :** Détecter et notifier les problèmes le plus rapidement possible.
- **Contexte :** Les alertes doivent fournir suffisamment de contexte pour comprendre la nature et la gravité du problème.
- **Escalade :** Définir des niveaux de criticité et des processus d'escalade si nécessaire.

### 4.2. Seuils et Conditions d'Alerte Clés (Exemples Post-MVP)

- **Système VPS :** Utilisation CPU > 90% pendant X minutes, mémoire disponible < X MB, espace disque < X GB.
- **Backend Spring Boot :** Taux d'erreur HTTP 5xx > X% sur Y minutes, latence p95 des requêtes > Z secondes, santé de l'application (`/actuator/health`) `DOWN`.
- **Base de Données PostgreSQL :** Nombre de connexions approchant `max_connections`, requêtes bloquées pendant une longue période, erreurs critiques dans les logs.
- **Frontend (Nginx/Traefik) :** Taux élevé d'erreurs 5xx.
- **Certificats SSL :** Expiration imminente.

### 4.3. Canaux de Notification (Post-MVP)

- Email.
- Plateformes de messagerie d'équipe (ex: Slack, Microsoft Teams).
- Systèmes de gestion d'astreintes (ex: PagerDuty, Opsgenie) pour les alertes critiques.

### 4.4. Outils d'Alerting (Exemples Post-MVP)

- Intégration avec le système de monitoring (ex: Alertmanager pour Prometheus, fonctionnalités d'alerte de Grafana).
- Services Cloud (AWS CloudWatch Alarms, Google Cloud Monitoring Alerts, etc.).
- Solutions SaaS (Datadog, New Relic, etc.).

## 5. Tracing Distribué (Post-MVP)

**Statut : Post-MVP**

Le tracing distribué permet de suivre le parcours d'une requête à travers plusieurs services (microservices). Pour l'architecture actuelle du MVP (frontend statique appelant une API backend monolithique simple), son utilité est limitée. Il deviendrait pertinent si le backend évoluait vers une architecture de microservices plus complexe.

### 5.1. Objectifs et Bénéfices (Post-MVP)

- **Visibilité de bout en bout :** Comprendre comment une requête traverse les différents services.
- **Analyse de Latence :** Identifier les goulots d'étranglement dans un système distribué en mesurant le temps passé dans chaque service.
- **Débogage d'Erreurs :** Localiser plus facilement le service responsable d'une erreur dans une chaîne d'appels.
- **Analyse de Dépendances :** Visualiser les dépendances entre les services.

### 5.2. Outils Envisagés (Exemples Post-MVP)

- **OpenTelemetry (OTel) :** Standard ouvert pour l'instrumentation, la collecte et l'exportation de données de télémétrie (traces, métriques, logs). De plus en plus adopté.
- **Jaeger :** Système de tracing distribué open-source, souvent utilisé avec OpenTelemetry.
- **Zipkin :** Autre système de tracing distribué open-source populaire.
- **Solutions SaaS APM :** Datadog, New Relic, Dynatrace, etc., fournissent souvent des fonctionnalités de tracing distribué.

## 6. Gestion des Incidents et Runbooks

Bien que la stratégie d'observabilité vise à détecter et diagnostiquer les problèmes, une gestion efficace des incidents nécessite également des procédures claires sur la manière de réagir.

- **MVP :**
  - Pour le MVP, la gestion des incidents sera réactive. L'équipe (principalement le développeur/opérateur unique) interviendra en cas de détection de problème (par exemple, via une surveillance manuelle, un utilisateur signalant un problème, ou une défaillance évidente du service).
  - Les diagnostics s'appuieront sur les outils de logging et de monitoring manuels décrits dans ce document.
- **Post-MVP :**
  - Développer des runbooks plus formels pour les problèmes courants ou critiques.
  - Mettre en place un processus de post-mortem pour analyser les incidents majeurs et en tirer des leçons.
- **Documentation de Référence :**
  - Les procédures opérationnelles initiales, y compris les étapes de dépannage de base pour les différents composants (vérification des logs, redémarrage des conteneurs, etc.), seront documentées dans `docs/operations/runbook.md`. Ce document servira de point de départ pour une gestion plus structurée des incidents.

## 7. Révision et Amélioration Continue

La stratégie d'observabilité n'est pas un document statique. Elle doit évoluer avec le système et les besoins du projet.

- **Fréquence de Révision :**
  - Une revue formelle de cette stratégie sera effectuée au moins tous les **6 mois**, ou plus fréquemment si des changements majeurs dans l'architecture ou les fonctionnalités sont introduits.
  - Des revues ad hoc peuvent également être déclenchées suite à des incidents significatifs pour identifier les lacunes dans la couverture de l'observabilité.
- **Processus de Révision :**
  - Évaluer l'efficacité des outils et des processus de logging et de monitoring en place.
  - Identifier les métriques qui ne sont plus pertinentes ou celles qui manquent.
  - Vérifier si les politiques de rétention des logs sont toujours adéquates.
  - Évaluer le besoin de passer à des solutions plus avancées (agrégation de logs, dashboards, alerting, tracing) en fonction de la complexité du système, du volume de trafic, et des incidents rencontrés.
  - Mettre à jour ce document pour refléter les changements.
- **Responsabilité :** L'Architecte et/ou le responsable technique du projet sera en charge de mener ces révisions.

## 8. Change Log

| Date       | Version | Description                                                                                                                                                  | Auteur                            |
| :--------- | :------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------- |
| 2025-05-11 | 0.1     | Création initiale du document de stratégie d'observabilité. Couvre le logging, le monitoring pour le MVP, et ébauche l'alerting et le tracing pour post-MVP. | 3 - Architecte (IA) & Utilisateur |
