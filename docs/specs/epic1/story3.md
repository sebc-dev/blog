# Story 1.3: Mise en Place de Traefik comme Reverse Proxy

**Status:** Draft

## Goal & Context

**User Story:** En tant qu'Administrateur Système (Admin), je veux mettre en place Traefik comme reverse proxy dans un conteneur Docker sur le VPS afin de gérer le trafic entrant HTTPS, obtenir et renouveler automatiquement les certificats SSL (Let's Encrypt), et router les requêtes vers les services frontend et backend.

**Context:** Suite à l'installation de Docker (Story 1.2), cette story configure le point d'entrée principal pour toutes les requêtes web vers l'application. Traefik simplifiera la gestion SSL et le routage vers les futurs conteneurs applicatifs.

## Detailed Requirements

Déployer et configurer Traefik Proxy (version spécifiée dans `docs/teck-stack.md`) en tant que conteneur Docker. Configurer les points d'entrée HTTP/HTTPS, l'intégration avec Let's Encrypt pour les certificats SSL, et préparer Traefik à découvrir et router vers d'autres services Docker.

## Acceptance Criteria (ACs)

- AC1: Un conteneur Docker Traefik est fonctionnel sur le VPS.
- AC2: Traefik écoute sur les ports 80 (HTTP) et 443 (HTTPS).
- AC3: La redirection automatique de HTTP vers HTTPS est configurée et fonctionnelle.
- AC4: La configuration ACME pour Let's Encrypt est en place (avec un e-mail d'admin) et Traefik peut obtenir des certificats SSL pour un domaine de test (ou le domaine principal si déjà configuré). Un volume Docker est utilisé pour persister `acme.json` avec les permissions 600.
- AC5: Traefik est configuré pour utiliser le fournisseur Docker afin de découvrir dynamiquement les services.
- AC6: Un routage de base vers un service placeholder (ex: un simple conteneur `whoami` ou `nginx`) via un nom d'hôte est fonctionnel et accessible en HTTPS avec un certificat valide.
- AC7: Si le dashboard Traefik est activé en production (optionnel pour MVP mais souvent utile), il est sécurisé par une authentification (ex: Basic Auth).

## Technical Implementation Context

**Guidance:** Utiliser les détails suivants pour l'implémentation. La configuration de Traefik se fera via un fichier de configuration statique (`traefik.yml`) et/ou des labels Docker sur le conteneur Traefik lui-même (via `docker-compose.yml`).

- **Relevant Files:**
  - Files to Create:
    - `traefik/traefik.yml` (fichier de configuration statique de Traefik)
    - `traefik/acme.json` (fichier vide initial pour les certificats Let's Encrypt, avec permissions 600)
    - Potentiellement un fichier pour les utilisateurs de l'authentification Basic Auth du dashboard.
  - Files to Modify:
    - `docker-compose.yml` (pour définir le service Traefik et ses configurations dynamiques via labels Docker).
    - `.env` (pour `TRAEFIK_ACME_EMAIL`, `TRAEFIK_DOMAIN_MAIN`, et potentiellement les identifiants du dashboard).
  - _(Hint: Voir `docs/project-structure.md` pour l'emplacement général, et `docs/architecture/architecture-principale.md` section Infrastructure et Déploiement pour le rôle de Traefik)_

- **Key Technologies:**
  - Traefik Proxy (version 3.4 "Chaource" GA ou compatible, voir `docs/teck-stack.md`)
  - Docker, Docker Compose
  - Let's Encrypt (via intégration ACME de Traefik)
  - _(Hint: Voir `docs/teck-stack.md` pour la liste complète)_

- **API Interactions / SDK Usage:**
  - Traefik interagit avec l'API Let's Encrypt pour les certificats.

- **UI/UX Notes:**
  - Concerne principalement la disponibilité du site via HTTPS et le dashboard Traefik (si activé).

- **Data Structures:**
  - `acme.json` stocke les certificats SSL.

- **Environment Variables:**
  - `TRAEFIK_ACME_EMAIL` (requis pour Let's Encrypt)
  - `TRAEFIK_DOMAIN_MAIN` (domaine principal du blog, ex: `kalifazzia.blog` ou un sous-domaine de test)
  - `TRAEFIK_DASHBOARD_USER`, `TRAEFIK_DASHBOARD_PASSWORD` (si dashboard activé et sécurisé).
  - _(Hint: Voir `docs/environnement-vars.md`)_

- **Coding Standards Notes:**
  - Les fichiers de configuration Traefik (YAML) doivent être clairs et bien commentés.
  - Suivre les recommandations de sécurité pour Traefik.
  - _(Hint: Voir `docs/normes-codage.md`)_

## Tasks / Subtasks

- [ ] Préparer la configuration de Traefik :
    - [ ] Créer un répertoire pour la configuration de Traefik (ex: `./traefik_data/`).
    - [ ] Créer le fichier de configuration statique `traefik.yml` (ou `traefik.toml`) dans ce répertoire. Configurer :
        - Les points d'entrée (`web` sur port 80, `websecure` sur port 443).
        - Le fournisseur Docker (`providers.docker.exposedByDefault = false`).
        - Les résolveurs de certificats ACME pour Let's Encrypt (email, stockage `acme.json`, challenge HTTP ou TLS).
        - (Optionnel) Configuration de l'API et du dashboard Traefik (avec middleware de sécurité Basic Auth).
    - [ ] Créer un fichier `acme.json` vide dans le répertoire de configuration et lui donner les permissions `600` (`touch acme.json && chmod 600 acme.json`).
- [ ] Définir le service Traefik dans `docker-compose.yml` (racine du projet) :
    - [ ] Utiliser l'image officielle `traefik:<version>`.
    - [ ] Mapper les ports `80:80` et `443:443`.
    - [ ] Monter les volumes :
        - Le socket Docker (`/var/run/docker.sock:/var/run/docker.sock:ro`).
        - Le fichier de configuration statique (`./traefik_data/traefik.yml:/etc/traefik/traefik.yml:ro`).
        - Le fichier `acme.json` (`./traefik_data/acme.json:/acme.json`).
    - [ ] Définir les variables d'environnement nécessaires (ex: pour Basic Auth du dashboard, si configuré dans `traefik.yml`).
    - [ ] Ajouter des labels Docker au service Traefik pour configurer :
        - La redirection HTTP vers HTTPS.
        - (Optionnel) Le routage pour le dashboard Traefik lui-même (ex: `traefik.votre-domaine.com`) avec le middleware Basic Auth.
    - [ ] S'assurer que le conteneur Traefik fait partie d'un réseau Docker dédié (ex: `webproxy_net`) que les autres services pourront rejoindre.
- [ ] (Optionnel pour test initial) Définir un service placeholder dans `docker-compose.yml` (ex: `whoami` de `traefik/whoami` ou un simple `nginx`) :
    - [ ] Lui assigner des labels Docker pour que Traefik le découvre et crée une route (ex: `test-service.votre-domaine.com`).
    - [ ] Spécifier l'utilisation du résolveur de certificats Let's Encrypt.
    - [ ] S'assurer que ce service rejoint le même réseau Docker que Traefik.
- [ ] Mettre à jour les variables d'environnement dans le fichier `.env` (`TRAEFIK_ACME_EMAIL`, `TRAEFIK_DOMAIN_MAIN`, etc.).
- [ ] Lancer Traefik (et le service de test) avec `docker compose up -d traefik nom_service_test`.
- [ ] Vérifier les logs de Traefik pour la génération de certificats et le routage.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.
- **Manual/CLI Verification:**
  - Vérifier les logs du conteneur Traefik (`docker logs traefik_container_name`) pour les erreurs et la réussite de l'obtention du certificat Let's Encrypt.
  - Accéder à `http://TRAEFIK_DOMAIN_MAIN` (doit rediriger vers HTTPS).
  - Accéder à `https://TRAEFIK_DOMAIN_MAIN` (ou le domaine du service de test) : doit afficher le service de test avec un certificat SSL valide émis par Let's Encrypt.
  - Vérifier les détails du certificat dans le navigateur.
  - Si le dashboard est activé, vérifier son accès et la protection par authentification.
  - Vérifier les permissions du fichier `acme.json` sur le VPS (doit être `600`).
- _(Hint: Voir `docs/strategie-tests.md` pour l'approche globale et `docs/architecture/architecture-principale.md` pour le rôle de Traefik)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
- **Change Log:**
  - Initial Draft