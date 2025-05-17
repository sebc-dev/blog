### Story 1.3: Mise en Place de Traefik comme Reverse Proxy

**Status:** Revised

#### Goal & Context

**User Story:** En tant qu'Administrateur Système (Admin), je veux mettre en place Traefik v3.4.0 comme reverse proxy dans un conteneur Docker sur le VPS afin de gérer le trafic entrant HTTPS, obtenir et renouveler automatiquement les certificats SSL (Let's Encrypt), et router les requêtes vers les services frontend et backend.
**Context:** Suite à l'installation de Docker (Story 1.2), cette story configure le point d'entrée principal pour toutes les requêtes web vers l'application. Traefik simplifiera la gestion SSL et le routage vers les futurs conteneurs applicatifs. Il est à noter que Traefik v3.4 introduit un nettoyage automatique des chemins d'URL (ex: // ou /./ sont simplifiés), ce qui est généralement bénéfique pour la sécurité.

**Note sur le Challenge ACME :** Bien que le challenge TLS-ALPN-01 soit mentionné comme recommandé dans la guidance initiale, l'implémentation ci-dessous détaille la méthode du **DNS Challenge**, telle que discutée et documentée dans les sources. Cette méthode est particulièrement adaptée pour l'obtention de certificats wildcard et l'automatisation avec le fournisseur DNS OVH mentionné dans les sources.

#### Technical Implementation Context

**Guidance:** Utiliser les détails suivants pour l'implémentation. La configuration de Traefik se fera via des labels Docker sur le conteneur Traefik lui-même (via docker-compose.yml).

- **Relevant Files:**
  - Files to Create:
    - `./letsencrypt/acme.json` (fichier vide initial pour les certificats Let's Encrypt, avec permissions 600)
    - `./secrets/ovh_app_key.txt`, `./secrets/ovh_app_secret.txt`, `./secrets/ovh_consumer_key.txt` (pour les secrets Docker) - **Permissions 600 impératives**
    - `./secrets/traefik_dashboard_credentials.txt` (pour l'authentification du tableau de bord)
  - Files to Modify:
    - `docker-compose.yml` (pour définir le service Traefik, les volumes, les réseaux, les secrets et ses configurations dynamiques via labels Docker)
    - `.env` (pour `LETSENCRYPT_EMAIL`, `MY_DOMAIN`, `TRAEFIK_SUBDOMAIN`, et potentiellement d'autres variables non sensibles)
  - _(Hint: Voir docs/project-structure.md pour l'emplacement général, et docs/architecture/architecture-principale.md section Infrastructure et Déploiement pour le rôle de Traefik)_
- **Key Technologies:**
  - Traefik Proxy ( **v3.4.0** ou compatible)
  - Docker, Docker Compose
  - Let's Encrypt (via intégration ACME de Traefik)
  - **Challenge ACME : DNS Challenge** (méthode détaillée ici, nécessite l'intégration avec le fournisseur DNS OVH)
  - _(Hint: Voir docs/teck-stack.md pour la liste complète)_
- **API Interactions / SDK Usage:**
  - Traefik interagit avec l'API Let's Encrypt (ACME) pour les certificats.
  - Traefik interagit avec l'API du fournisseur DNS OVH pour le DNS Challenge.
  - Traefik interagit avec l'API Docker pour découvrir les services.
- **UI/UX Notes:**
  - Concerne principalement la disponibilité du site via HTTPS et le dashboard Traefik (si activé et sécurisé).
- **Data Structures:**
  - `acme.json` stocke les certificats SSL et les informations ACME. **Doit être sauvegardé régulièrement**.
- **Environment Variables:**
  - `LETSENCRYPT_EMAIL` (requis pour Let's Encrypt)
  - `MY_DOMAIN` (domaine principal du blog, ex: `kalifazzia.blog` ou un sous-domaine de test)
  - `TRAEFIK_SUBDOMAIN` (ex: `traefik` pour `traefik.kalifazzia.blog`, si dashboard activé)
  - `TRAEFIK_DASHBOARD_USER`, `TRAEFIK_DASHBOARD_PASSWORD_HASHED` (si dashboard activé avec Basic Auth)
  - Variables spécifiques au fournisseur DNS (ex: pour OVH, `OVH_ENDPOINT_CONFIG`) - **Utilisation des Secrets Docker via les variables `_FILE` fortement recommandée**
  - _(Hint: Voir docs/environnement-vars.md)_
- **Coding Standards Notes:**
  - Les fichiers de configuration YAML (docker-compose) doivent être clairs et bien commentés.
  - Suivre les recommandations de sécurité pour Traefik, notamment :
    - **Utilisation de Docker Secrets** pour les données sensibles (clés API DNS, mot de passe haché du dashboard).
    - **Sécurisation du dashboard** en désactivant l'accès non sécurisé et en utilisant un routeur dédié avec authentification (Basic Auth) et TLS.
    - **Redirection automatique HTTP vers HTTPS**.
    - **Le durcissement TLS** (options de chiffrement, version minimale, etc.).
  - **Migration progressive des labels** de la syntaxe v2 à v3, en utilisant `--core.defaultRuleSyntax=v2` temporairement si nécessaire.
  - **Définition explicite du service et du port interne** dans les labels Docker pour Traefik v3 est une bonne pratique.
  - _(Hint: Voir docs/normes-codage.md)_

#### Tasks / Subtasks

- **Initial Setup:**
  - [x] Configurer le pare-feu du VPS pour autoriser les ports 80 et 443 entrants.
  - [x] Configurer les enregistrements DNS pour `MY_DOMAIN` (et `TRAEFIK_SUBDOMAIN.MY_DOMAIN` si utilisé) pour qu'ils pointent vers l'IP du VPS.
  - [x] Créer la structure de répertoires : un répertoire principal pour le projet, et les sous-répertoires `./letsencrypt/` et `./secrets/`.
- **acme.json File:**
  - [x] Créer un fichier `acme.json` vide dans `./letsencrypt/` (touch `./letsencrypt/acme.json`).
  - [x] Lui donner les permissions 600 (`chmod 600 ./letsencrypt/acme.json`).
  - [x] **Noter l'impératif de sauvegarder** `acme.json` **régulièrement après la génération réussie des certificats**.
- **Docker Secrets Files:**
  - [x] Créer un fichier par secret sensible pour OVH dans le répertoire `./secrets/`. Chaque fichier ne doit contenir que la valeur du secret (ex: `./secrets/ovh_app_key.txt` contenant uniquement la clé d'application OVH).
  - [x] Donner les permissions 600 à chaque fichier secret (ex: `chmod 600 ./secrets/ovh_app_key.txt`).
  - [x] Créer un fichier `traefik_dashboard_credentials.txt` dans le répertoire `./secrets/` contenant la ligne `${TRAEFIK_DASHBOARD_USER}:${TRAEFIK_DASHBOARD_PASSWORD_HASHED}` (remplacer par les valeurs réelles).
  - [x] Donner les permissions 600 au fichier `traefik_dashboard_credentials.txt` (`chmod 600 ./secrets/traefik_dashboard_credentials.txt`).
- **.env File:**
  - [x] Créer ou modifier le fichier `.env` à la racine du projet pour définir les variables suivantes :
    - `LETSENCRYPT_EMAIL="votre-email@votredomaine.com"` (à remplacer par votre email)
    - `MY_DOMAIN="votredomaine.com"` (à remplacer par votre domaine principal)
    - `TRAEFIK_SUBDOMAIN="traefik"` (sous-domaine pour le dashboard)
    - `TRAEFIK_DASHBOARD_USER="votre_utilisateur"` (utilisateur pour le dashboard Basic Auth)
    - `TRAEFIK_DASHBOARD_PASSWORD_HASHED="mot_de_passe_hashe_htpasswd"` (mot de passe haché, voir tâche ci-dessous)
    - `OVH_ENDPOINT_CONFIG="ovh-europe"` (endpoint OVH)
- **Generate Hashed Password for Dashboard Basic Auth:**
  - [x] Installer `htpasswd` si non présent (ex: `sudo apt-get update && sudo apt-get install apache2-utils`).
  - [x] Générer le mot de passe haché pour l'utilisateur et le mot de passe choisis (`htpasswd -nb votre_utilisateur votre_mot_de_passe`).
  - [x] Copier la sortie (la chaîne `utilisateur:haché`). **Échapper les caractères `$` par `$$` si vous collez directement dans un fichier `.yml` ou `.env`**.
  - [x] Coller uniquement le mot de passe haché (sans le nom d'utilisateur) dans votre fichier `.env` pour la variable `TRAEFIK_DASHBOARD_PASSWORD_HASHED`.
- **docker-compose.yml for Traefik Service:**
  - [x] Créer ou modifier le fichier `docker-compose.yml` à la racine du projet.
  - [x] Définir le service `traefik` selon l'exemple suivant :

```yaml
version: "3.3"

services:
  traefik:
    image: "traefik:v3.4"
    container_name: "traefik"
    command:
      - "--log.level=INFO"
      - "--accesslog=true"
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
      - "--entrypoints.web.http.redirections.entrypoint.scheme=https"
      - "--entrypoints.web.http.redirections.entrypoint.permanent=true"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.myresolver.acme.dnschallenge=true"
      - "--certificatesresolvers.myresolver.acme.dnschallenge.provider=ovh"
      # - "--certificatesresolvers.myresolver.acme.caserver=https://acme-staging-v02.api.letsencrypt.org/directory" # Décommentez pour les tests
      - "--certificatesresolvers.myresolver.acme.email=${LETSENCRYPT_EMAIL}"
      - "--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json"
      - "--core.defaultRuleSyntax=v2" # Note: Traefik v3 pourrait avoir une syntaxe par défaut v3, vérifiez la documentation si des problèmes surviennent.
    ports:
      - "80:80"
      - "443:443"
    environment:
      - "OVH_ENDPOINT=${OVH_ENDPOINT_CONFIG}"
      - "OVH_APPLICATION_KEY_FILE=/run/secrets/ovh_app_key_secret"
      - "OVH_APPLICATION_SECRET_FILE=/run/secrets/ovh_app_secret_secret"
      - "OVH_CONSUMER_KEY_FILE=/run/secrets/ovh_consumer_key_secret"
    volumes:
      - "./letsencrypt:/letsencrypt"
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
    secrets:
      - ovh_app_key_secret
      - ovh_app_secret_secret
      - ovh_consumer_key_secret
      - traefik_dashboard_credentials_secret
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik-dashboard.rule=Host(`${TRAEFIK_SUBDOMAIN}.${MY_DOMAIN}`) && (PathPrefix(`/api`) || PathPrefix(`/dashboard`))"
      - "traefik.http.routers.traefik-dashboard.service=api@internal"
      - "traefik.http.routers.traefik-dashboard.entrypoints=websecure"
      - "traefik.http.routers.traefik-dashboard.tls.certresolver=myresolver"
      - "traefik.http.routers.traefik-dashboard.middlewares=dashboard-auth@docker"
      - "traefik.http.middlewares.dashboard-auth.basicauth.usersfile=/run/secrets/traefik_dashboard_credentials_secret"

secrets:
  ovh_app_key_secret:
    file: ./secrets/ovh_app_key.txt
  ovh_app_secret_secret:
    file: ./secrets/ovh_app_secret.txt
  ovh_consumer_key_secret:
    file: ./secrets/ovh_consumer_key.txt
  traefik_dashboard_credentials_secret:
    file: ./secrets/traefik_dashboard_credentials.txt
```

- **(Optionnel pour test initial) Définir un service placeholder dans** `docker-compose.yml` **(ex:** `mon-app` **avec** `traefik/whoami`**):**
  - [x] Ajouter une section pour votre service de test (ex: `whoami`):

```yaml
whoami:
  image: "traefik/whoami:v1.10"
  container_name: "simple-service"
  labels:
    - "traefik.enable=true"
    - "traefik.http.routers.mon-app-https.rule=Host(`test-service.${MY_DOMAIN}`)"
    - "traefik.http.routers.mon-app-https.entrypoints=websecure"
    - "traefik.http.routers.mon-app-https.tls=true"
    - "traefik.http.routers.mon-app-https.tls.certresolver=myresolver"
    - "traefik.http.routers.mon-app-https.service=mon-app-svc"
    - "traefik.http.services.mon-app-svc.loadbalancer.server.port=80"
```

- **Déploiement et Tests Initiaux:**
  - [x] **S'assurer que la ligne** `--certificatesresolvers.myresolver.acme.caserver=...` **est décommentée pour pointer vers le serveur de staging de Let's Encrypt**.
  - [x] Lancer Traefik (et le service de test optionnel) : `docker compose up -d`.
  - [x] **Vérifier les logs de Traefik** (`docker logs -f traefik`) pour confirmer qu'il démarre sans erreur, détecte les services, et initie la demande de certificat de staging.
  - [x] Attendre quelques minutes le temps de la validation DNS.
  - [x] Tester l'accès au service de test via HTTPS (`https://test-service.votredomaine.com/`). Vérifier que le certificat est émis par "Fake LE Intermediate X1" (staging).
  - [x] Tester la redirection HTTP vers HTTPS (`http://test-service.votredomaine.com/`).
  - [x] Tester l'accès au dashboard sécurisé (`https://traefik.votredomaine.com/dashboard/`). Vérifier l'authentification Basic Auth et l'accès en HTTPS.
- **Passage en Production (Certificats Réels):**
  - [x] Si les tests avec le serveur de staging sont concluants, **commenter la ligne** `--certificatesresolvers.myresolver.acme.caserver=...` **dans** `docker-compose.yml`.
  - [x] **Supprimer ou renommer le fichier `acme.json` existant** (pour forcer Traefik à redemander un certificat à l'environnement de production).
  - [x] Redémarrer le service Traefik (`docker compose restart traefik` ou `docker compose up -d --force-recreate traefik`).
  - [x] **Vérifier à nouveau les logs de Traefik** pour confirmer l'obtention des certificats de production.
  - [x] Tester l'accès aux services via HTTPS et vérifier que le certificat est maintenant émis par "Let's Encrypt".

#### Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** <Agent Model Name/Version>
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
- **Change Log:**
  - Initial Draft
  - Revised based on "Validation Approfondie de la User Story" report, incorporating detailed steps and security best practices.
  - **Revised based on discussion and sources, detailing the DNS Challenge method for Let's Encrypt, emphasizing Docker Secrets for sensitive data, dashboard security, HTTP->HTTPS redirection, v3 migration considerations, and explicit service/port definition in labels.**
  - **Revised to utiliser uniquement docker-compose, préciser OVH comme fournisseur DNS, corriger l'emplacement de acme.json, et ajouter l'utilisation des secrets Docker pour les identifiants du tableau de bord.**
