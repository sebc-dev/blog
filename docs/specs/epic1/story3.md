import re

# Story 1.3: Mise en Place de Traefik comme Reverse Proxy

**Status:** Revised

## Goal & Context

**User Story:** En tant qu'Administrateur Système (Admin), je veux mettre en place Traefik v3.4.0 comme reverse proxy dans un conteneur Docker sur le VPS afin de gérer le trafic entrant HTTPS, obtenir et renouveler automatiquement les certificats SSL (Let's Encrypt), et router les requêtes vers les services frontend et backend.

**Context:** Suite à l'installation de Docker (Story 1.2), cette story configure le point d'entrée principal pour toutes les requêtes web vers l'application. Traefik simplifiera la gestion SSL et le routage vers les futurs conteneurs applicatifs. Il est à noter que Traefik v3.4 introduit un nettoyage automatique des chemins d'URL (ex: `//` ou `/./` sont simplifiés), ce qui est généralement bénéfique pour la sécurité.

## Detailed Requirements

Déployer et configurer Traefik Proxy (version **v3.4.0** ou la dernière version patch disponible, comme spécifié dans `docs/teck-stack.md`) en tant que conteneur Docker. Configurer les points d'entrée HTTP/HTTPS avec redirection globale, l'intégration avec Let's Encrypt pour les certificats SSL (en utilisant le challenge TLS-ALPN-01 de préférence ), et préparer Traefik à découvrir et router vers d'autres services Docker via des contraintes de fournisseur spécifiques.

## Acceptance Criteria (ACs)

- AC1: Un conteneur Docker Traefik **v3.4.0** (ou version patch spécifiée) est fonctionnel sur le VPS.
- AC2: Traefik écoute sur les ports 80 (HTTP) et 443 (HTTPS), avec des **timeouts d'entrée configurés**.
- AC3: La redirection automatique globale de HTTP vers HTTPS est configurée dans la configuration statique de Traefik et est fonctionnelle.
- AC4: La configuration ACME pour Let's Encrypt est en place (avec un e-mail d'admin) et Traefik peut obtenir des certificats SSL pour un domaine de test. Un volume Docker est utilisé pour persister `acme.json` avec les permissions 600. **L'importance de la sauvegarde régulière de `acme.json` est notée**. **Le test initial avec le serveur de staging de Let's Encrypt est obligatoire**.
- AC5: Traefik est configuré pour utiliser le fournisseur Docker afin de découvrir dynamiquement les services, **avec des `constraints` pour limiter les conteneurs exposés**.
- AC6: Un routage de base vers un service placeholder (ex: un simple conteneur `whoami` ou `nginx`) via un nom d'hôte est fonctionnel et accessible en HTTPS avec un certificat valide, **et inclut des middlewares pour les en-têtes de sécurité et la compression**.
- AC7: Si le dashboard Traefik est activé en production, il est sécurisé par une authentification robuste (ex: **Forward Auth fortement recommandé**, ou Basic Auth comme minimum viable).
- AC8: La configuration TLS est durcie (version minimale TLS 1.2/1.3, suites de chiffrement robustes).

## Technical Implementation Context

**Guidance:** Utiliser les détails suivants pour l'implémentation. La configuration de Traefik se fera via un fichier de configuration statique (`traefik.yml`) et des labels Docker sur le conteneur Traefik lui-même (via `docker-compose.yml`).

- **Relevant Files:**
    - Files to Create:
        - `traefik_data/traefik.yml` (fichier de configuration statique de Traefik)
        - `traefik_data/acme.json` (fichier vide initial pour les certificats Let's Encrypt, avec permissions 600)
        - Potentiellement un fichier pour les utilisateurs de l'authentification si Basic Auth est utilisé pour le dashboard.
    - Files to Modify:
        - `docker-compose.yml` (pour définir le service Traefik et ses configurations dynamiques via labels Docker).
        - `.env` (pour `TRAEFIK_ACME_EMAIL`, `TRAEFIK_DOMAIN_MAIN`, `TRAEFIK_DASHBOARD_DOMAIN`, et potentiellement les identifiants du dashboard ou de Forward Auth).
    - _(Hint: Voir `docs/project-structure.md` pour l'emplacement général, et `docs/architecture/architecture-principale.md` section Infrastructure et Déploiement pour le rôle de Traefik)_

- **Key Technologies:**
    - Traefik Proxy (**v3.4.0** ou compatible, voir `docs/teck-stack.md`)
    - Docker, Docker Compose
    - Let's Encrypt (via intégration ACME de Traefik, **challenge TLS-ALPN-01 recommandé** )
    - _(Hint: Voir `docs/teck-stack.md` pour la liste complète)_

- **API Interactions / SDK Usage:**
    - Traefik interagit avec l'API Let's Encrypt pour les certificats.

- **UI/UX Notes:**
    - Concerne principalement la disponibilité du site via HTTPS et le dashboard Traefik (si activé).

- **Data Structures:**
    - `acme.json` stocke les certificats SSL. **Doit être sauvegardé régulièrement**.

- **Environment Variables:**
    - `TRAEFIK_ACME_EMAIL` (requis pour Let's Encrypt)
    - `TRAEFIK_DOMAIN_MAIN` (domaine principal du blog, ex: `kalifazzia.blog` ou un sous-domaine de test)
    - `TRAEFIK_DASHBOARD_DOMAIN` (ex: `traefik.kalifazzia.blog`, si dashboard activé)
    - `TRAEFIK_DASHBOARD_USER`, `TRAEFIK_DASHBOARD_PASSWORD_HASHED` (si dashboard activé avec Basic Auth).
    - (Variables pour Forward Auth si cette méthode est choisie)
    - _(Hint: Voir `docs/environnement-vars.md`)_

- **Coding Standards Notes:**
    - Les fichiers de configuration Traefik (YAML) doivent être clairs et bien commentés.
    - Suivre les recommandations de sécurité pour Traefik, notamment **le durcissement TLS**  et l'utilisation de **`Forward Auth` pour le dashboard**.
    - _(Hint: Voir `docs/normes-codage.md`)_

## Tasks / Subtasks

-   **Initial Setup:**
    -   [x] Configurer le pare-feu du VPS pour autoriser les ports 80 et 443 entrants.
    -   [x] Configurer les enregistrements DNS pour `TRAEFIK_DOMAIN_MAIN` (et `TRAEFIK_DASHBOARD_DOMAIN` si utilisé) pour qu'ils pointent vers l'IP du VPS.
-   **Traefik Static Configuration (`traefik.yml`):**
    -   [ ] Créer le répertoire `./traefik_data/`.
    -   [ ] Créer le fichier `traefik_data/traefik.yml`. Y configurer :
        -   **Global Settings**:
            -   `global.checkNewVersion: true`
            -   `global.sendAnonymousUsage: false` (Recommandé pour la confidentialité)
        -   **Log Settings**:
            -   `log.level: INFO` (Utiliser `DEBUG` pour le dépannage)
            -   `log.filePath: "/var/log/traefik.log"` (Optionnel, sinon stdout)
            -   `log.format: json` (Recommandé pour un parsing structuré)
        -   **API and Dashboard**:
            -   `api.dashboard: true`
        -   **EntryPoints**:
            -   `web`:
                -   `address: ":80"`
                -   `http.redirections.entryPoint.to: "websecure"` 
                -   `http.redirections.entryPoint.scheme: "https"`
                -   `http.redirections.entryPoint.permanent: true`
                -   `transport.respondingTimeouts.readTimeout: "60s"` 
                -   `transport.respondingTimeouts.writeTimeout: "60s"` 
                -   `transport.respondingTimeouts.idleTimeout: "180s"` 
            -   `websecure`:
                -   `address: ":443"`
                -   `http.tls.certResolver: "myresolver"` (ou nom choisi)
                -   `http.tls.options: "default@file"` (ou `default@internal` si défini dans `traefik.yml`)
                -   `transport.respondingTimeouts.readTimeout: "60s"` 
                -   `transport.respondingTimeouts.writeTimeout: "60s"` 
                -   `transport.respondingTimeouts.idleTimeout: "180s"` 
        -   **Providers**:
            -   `docker.endpoint: "unix:///var/run/docker.sock"`
            -   `docker.exposedByDefault: false` 
            -   `docker.network: "webproxy_net"`
            -   `docker.constraints: "Label(\`myapp.traefik.managed\`, \`true\`)"` 
            -   (Optionnel) `file.directory: /etc/traefik/dynamic_conf/` (si utilisé pour middlewares, etc.)
            -   (Optionnel) `file.watch: true`
        -   **Certificate Resolvers (ACME for Let's Encrypt)**:
            -   `myresolver` (ou nom choisi, ex: `letsencrypt_tls`):
                -   `acme.email: ${TRAEFIK_ACME_EMAIL}`
                -   `acme.storage: "/acme.json"`
                -   `acme.caServer: "https://acme-staging-v02.api.letsencrypt.org/directory"` (**À utiliser IMPÉRATIVEMENT pour les tests initiaux**) 
                -   `acme.tlsChallenge: {}` (Challenge TLS-ALPN-01 recommandé) 
                -   (Alternative) `acme.httpChallenge.entryPoint: web` (si challenge HTTP-01 est choisi) 
        -   **TLS Options** (ex: `default` ou nom personnalisé, peut être dans `traefik.yml` ou fichier dynamique):
            -   `tls.options.default.minVersion: VersionTLS12` (ou `VersionTLS13`) 
            -   `tls.options.default.cipherSuites`: [Liste de suites robustes, ex: `TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256`, `TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256`, etc.] 
            -   `tls.options.default.curvePreferences: [CurveP256, CurveP384]`
            -   `tls.options.default.sniStrict: true` (Recommandé)
-   **`acme.json` File:**
    -   [ ] Créer un fichier `acme.json` vide dans `./traefik_data/`.
    -   [ ] Lui donner les permissions `600` (`touch ./traefik_data/acme.json && chmod 600 ./traefik_data/acme.json`).
    -   [ ] **Noter l'impératif de sauvegarder `acme.json` régulièrement après la génération réussie des certificats**.
-   **`docker-compose.yml` for Traefik Service:**
    -   [ ] Utiliser l'image `traefik:v3.4.0` (ou version patch spécifiée).
    -   [ ] Définir `container_name: traefik`.
    -   [ ] Configurer `restart: unless-stopped`.
    -   [ ] Ajouter `security_opt: [ "no-new-privileges:true" ]`.
    -   [ ] Attacher au réseau `networks: [ webproxy_net ]`.
    -   [ ] Mapper les ports `ports: [ "80:80", "443:443" ]`.
    -   [ ] Définir les `environment` variables (ex: `TRAEFIK_ACME_EMAIL` via `.env`).
    -   [ ] Monter les `volumes`:
        -   `/var/run/docker.sock:/var/run/docker.sock:ro` 
        -   `./traefik_data/traefik.yml:/etc/traefik/traefik.yml:ro` 
        -   `./traefik_data/acme.json:/acme.json` 
        -   (Optionnel) `./traefik_data/logs:/var/log` (pour la persistance des logs) 
    -   [ ] Ajouter des `labels` Docker pour Traefik lui-même (dashboard):
        -   `traefik.enable=true`
        -   `myapp.traefik.managed=true` (pour correspondre aux `constraints` du provider)
        -   `traefik.http.routers.traefik-dashboard.rule=Host(\`${TRAEFIK_DASHBOARD_DOMAIN}\`)`
        -   `traefik.http.routers.traefik-dashboard.service=api@internal`
        -   `traefik.http.routers.traefik-dashboard.entrypoints=websecure`
        -   `traefik.http.routers.traefik-dashboard.tls.certresolver=myresolver`
        -   `traefik.http.routers.traefik-dashboard.middlewares=dashboard-auth@docker` (ou nom choisi)
        -   Définir le middleware `dashboard-auth` (ex: `traefik.http.middlewares.dashboard-auth.basicAuth.users=${TRAEFIK_DASHBOARD_USER}:${TRAEFIK_DASHBOARD_PASSWORD_HASHED}`). **Fortement considérer `Forward Auth` pour la production**.
        -   (Optionnel) Ajouter un middleware d'IP Whitelist pour le dashboard.
-   **Network Definition in `docker-compose.yml`:**
    -   [ ] Définir `networks: { webproxy_net: { name: "webproxy_net" } }`.
-   **(Optionnel pour test initial) Définir un service placeholder dans `docker-compose.yml` (ex: `mon-app` avec `traefik/whoami`):**
    -   [ ] Labels:
        -   `traefik.enable=true` 
        -   `myapp.traefik.managed=true` 
        -   (Optionnel HTTP Router) `traefik.http.routers.mon-app-http.rule=Host(\`test-service.${TRAEFIK_DOMAIN_MAIN}\`)`, `entrypoints=web`, `service=mon-app-svc` 
        -   HTTPS Router: `traefik.http.routers.mon-app-https.rule=Host(\`test-service.${TRAEFIK_DOMAIN_MAIN}\`)`, `entrypoints=websecure`, `tls=true`, `tls.certresolver=myresolver`, `tls.options=default@file` (ou `@internal`), `service=mon-app-svc` 
        -   Appliquer middlewares: `traefik.http.routers.mon-app-https.middlewares=sec-headers@docker,compress-response@docker` 
    -   [ ] Service Traefik: `traefik.http.services.mon-app-svc.loadbalancer.server.port=80` (port interne de `whoami`) 
    -   [ ] Définir les middlewares (peuvent aussi être dans un fichier de configuration dynamique):
        -   `traefik.http.middlewares.sec-headers.headers.stsSeconds=31536000`
        -   `traefik.http.middlewares.sec-headers.headers.contentTypeNosniff=true`
        -   `traefik.http.middlewares.sec-headers.headers.frameDeny=true`
        -   `traefik.http.middlewares.sec-headers.headers.contentSecurityPolicy="default-src 'self';"` (À affiner)
        -   `traefik.http.middlewares.compress-response.compress=true`
    -   [ ] S'assurer que ce service rejoint le réseau `webproxy_net`.
-   **Mettre à jour les variables d'environnement dans le fichier `.env`** (`TRAEFIK_ACME_EMAIL`, `TRAEFIK_DOMAIN_MAIN`, `TRAEFIK_DASHBOARD_DOMAIN`, identifiants, etc.).
-   **Déploiement et Tests Initiaux:**
    -   [ ] **S'assurer que `caServer` pointe vers le serveur de staging de Let's Encrypt dans `traefik.yml`**.
    -   [ ] Lancer Traefik (et le service de test) avec `docker compose up -d traefik nom_service_test`.
    -   [ ] Vérifier les logs de Traefik (`docker logs traefik`) pour la génération de certificats (staging) et le routage.
-   **Passage en Production (Certificats Réels):**
    -   [ ] Si les tests avec le serveur de staging sont concluants, **commenter ou retirer la ligne `caServer` dans `traefik.yml`**.
    -   [ ] Redémarrer Traefik (`docker compose restart traefik` ou `docker compose up -d --force-recreate traefik`).
    -   [ ] Vérifier les logs pour l'obtention des certificats de production.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.
- **Manual/CLI Verification:**
    -   [ ] Vérifier les logs du conteneur Traefik (`docker logs traefik`) pour les erreurs et la réussite de l'obtention du certificat Let's Encrypt (d'abord staging, puis production).
    -   [ ] Accéder à `http://${TRAEFIK_DOMAIN_MAIN}` (doit rediriger vers HTTPS).
    -   [ ] Accéder à `https://${TRAEFIK_DOMAIN_MAIN}` (ou le domaine du service de test) : doit afficher le service de test avec un certificat SSL valide émis par Let's Encrypt (vérifier l'émetteur).
    -   [ ] Vérifier les détails du certificat dans le navigateur (émetteur, validité, chaîne).
    -   [ ] Si le dashboard est activé, vérifier son accès via `https://${TRAEFIK_DASHBOARD_DOMAIN}` et la protection par authentification.
    -   [ ] Vérifier les permissions du fichier `acme.json` sur le VPS (doit être `600`).
    -   [ ] **Inspecter la configuration active de Traefik via son API** (ex: `curl -skL http://localhost:8080/api/rawdata | jq '.'` si l'API est exposée localement et sécurisée, adapter le port si besoin).
    -   [ ] **Utiliser `openssl s_client -connect ${TRAEFIK_DOMAIN_MAIN}:443 -servername ${TRAEFIK_DOMAIN_MAIN}` pour vérifier la chaîne de certificats et les détails de la connexion TLS**.
- **External Tools:**
    -   [ ] **Une fois en production, utiliser SSL Labs Server Test (`ssllabs.com/ssltest/`) pour une analyse complète de la configuration HTTPS et du durcissement TLS**.
- **Debugging (si nécessaire):**
    -   [ ] Activer temporairement un niveau de log plus verbeux (`log.level: DEBUG` dans `traefik.yml` ou via l'option CLI `--log.level=DEBUG`) pour un dépannage approfondi.
- _(Hint: Voir `docs/strategie-tests.md` pour l'approche globale et `docs/architecture/architecture-principale.md` pour le rôle de Traefik)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
- **Change Log:**
  - Initial Draft
  - Revised based on "Validation Approfondie de la User Story" report, incorporating detailed steps and security best practices.