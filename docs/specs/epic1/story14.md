# Story 1.14: Docker Compose pour Production (VPS)

**Status:** Draft

## Goal & Context

**User Story:** En tant qu'Administrateur Système (Admin), je veux préparer un fichier `docker-compose.prod.yml` (ou adapter le `docker-compose.yml` de dev) pour le déploiement en production sur le VPS afin de disposer d'une configuration Docker Compose optimisée et sécurisée pour la production.

**Context:** Cette story finalise la préparation de l'infrastructure de l'Epic 1 en définissant la configuration spécifique à l'environnement de production. Elle s'appuiera sur les images Docker buildées par le futur pipeline CI/CD (Epic 7) et poussées vers un registre (GHCR).

## Detailed Requirements

Créer ou adapter un fichier `docker-compose.prod.yml`. Ce fichier doit :
- Utiliser les images Docker pré-buildées depuis un registre (ex: GitHub Container Registry - GHCR) au lieu de les builder localement.
- Ne pas exposer de ports non nécessaires à l'extérieur du VPS (ex: port direct de la base de données ou du backend si Traefik est le seul point d'entrée).
- Configurer des politiques de redémarrage appropriées (ex: `restart: unless-stopped` ou `always`).
- S'assurer que la configuration de Traefik est optimisée pour la production (Let's Encrypt pour le domaine réel, pas de dashboard insecure).
- Gérer les variables d'environnement de production de manière sécurisée (via un fichier `.env` sur le VPS, non versionné).

## Acceptance Criteria (ACs)

- AC1: Un fichier `docker-compose.prod.yml` est créé (ou le `docker-compose.yml` principal est adapté avec des surcharges pour la prod via un `.override.prod.yml` ou des profils Docker Compose).
- AC2: Les services `frontend` et `backend` sont configurés pour utiliser des images Docker tirées d'un registre (ex: `ghcr.io/your-username/blog-frontend:${IMAGE_TAG}`). Les `IMAGE_TAG` seront typiquement passés via des variables d'environnement lors du déploiement.
- AC3: Seuls les ports nécessaires sont exposés par Traefik (80, 443). Les ports directs des services `backend` et `db` ne sont pas mappés à l'hôte.
- AC4: Tous les services ont une politique de redémarrage configurée (ex: `restart: unless-stopped`).
- AC5: La configuration de Traefik dans `docker-compose.prod.yml` est adaptée à la production :
    - Utilisation du résolveur Let's Encrypt pour le domaine de production réel.
    - Dashboard Traefik désactivé ou sécurisé de manière robuste (pas `api.insecure=true`).
- AC6: Le fichier `docker-compose.prod.yml` référence un fichier `.env.prod` (ou un `.env` standard sur le VPS) pour les variables d'environnement spécifiques à la production.
- AC7: Une simulation de déploiement (ou un déploiement réel si l'infra CI/CD de base le permet) avec `docker compose -f docker-compose.prod.yml up -d` démarre les services en utilisant les images et configurations de production.

## Technical Implementation Context

**Guidance:** Adapter le `docker-compose.yml` de développement. Mettre l'accent sur la sécurité et l'utilisation d'images pré-buildées.

- **Relevant Files:**
  - Files to Create/Modify:
    - `docker-compose.prod.yml` (à la racine ou dans un répertoire de déploiement)
    - Un exemple de `.env.prod.example` pourrait être créé pour documenter les variables de prod. Le `.env.prod` réel sera sur le VPS.
  - _(Hint: Se référer à `docs/operations/runbook.md` (à créer) pour les procédures de déploiement en production et `docs/ci-cd/pipeline.md` (à créer) pour la manière dont les images sont buildées et taguées.)_

- **Key Technologies:**
  - Docker Compose
  - Docker
  - GitHub Container Registry (GHCR) ou autre registre d'images.
  - _(Hint: Voir `docs/teck-stack.md`)_

- **API Interactions / SDK Usage:**
  - Docker Compose interagit avec le démon Docker pour tirer les images du registre.

- **UI/UX Notes:**
  - Non applicable directement, mais assure que l'environnement de production est stable.

- **Data Structures:**
  - Gère les volumes pour la persistance des données de la DB et de Traefik en production.

- **Environment Variables:**
  - Variables pour les tags d'images (ex: `FRONTEND_IMAGE_TAG`, `BACKEND_IMAGE_TAG`).
  - Variables de production pour `TRAEFIK_ACME_EMAIL`, `TRAEFIK_DOMAIN_MAIN`, `POSTGRES_PASSWORD`, etc., chargées depuis le `.env` du VPS.
  - `SPRING_PROFILES_ACTIVE=prod` pour le backend.
  - _(Hint: Voir `docs/environnement-vars.md`)_

- **Coding Standards Notes:**
  - Le `docker-compose.prod.yml` doit être optimisé pour la production (pas de montage de code source, utilisation d'images spécifiques).
  - _(Hint: Voir `docs/normes-codage.md`)_

## Tasks / Subtasks

- [ ] Créer (ou copier et adapter depuis `docker-compose.yml`) le fichier `docker-compose.prod.yml`.
- [ ] Modifier la définition des services `frontend` et `backend` :
    - Remplacer la section `build:` par `image: ghcr.io/your-username/blog-frontend:${FRONTEND_IMAGE_TAG:-latest}` (adapter le chemin du registre).
    - Idem pour le backend : `image: ghcr.io/your-username/blog-backend:${BACKEND_IMAGE_TAG:-latest}`.
    - Supprimer les montages de volumes de code source pour le hot-reloading (ex: `./frontend:/app`, `./backend/src:/app/src`). Les fichiers sont dans l'image.
    - S'assurer que les `environment:` sections sont adaptées à la prod (ex: `SPRING_PROFILES_ACTIVE=prod`).
- [ ] Vérifier et ajuster les `ports:` sections :
    - Traefik doit toujours exposer 80 et 443.
    - Supprimer l'exposition des ports directs pour `db` et `backend` s'ils ne sont pas nécessaires en dehors du réseau Docker interne (Traefik gère l'accès externe).
- [ ] Ajouter/Vérifier les politiques de `restart:` (ex: `restart: unless-stopped`) pour tous les services.
- [ ] Revoir la configuration du service `traefik` pour la production :
    - S'assurer que la commande et/ou les labels n'activent pas le dashboard de manière non sécurisée (`--api.insecure=true` doit être supprimé ou remplacé par une authentification robuste si le dashboard est nécessaire en prod).
    - S'assurer que le `certificatesresolvers.letsencrypt.acme.email` et `TRAEFIK_DOMAIN_MAIN` sont corrects pour la production via les variables d'environnement.
- [ ] Configurer le chargement des variables d'environnement. Le `docker-compose.prod.yml` utilisera par défaut un fichier `.env` dans le même répertoire sur le VPS. S'assurer que les variables pour les tags d'images sont également gérées (elles seront typiquement mises à jour par le script de déploiement CI/CD).
- [ ] (Documentation) Créer un fichier `env.prod.example` listant les variables attendues sur le serveur de production.
- [ ] Tester le fichier `docker-compose.prod.yml` dans un environnement simulant la production (ou sur le VPS directement si les images sont disponibles sur GHCR). Cela implique :
    - D'avoir des images factices ou réelles sur GHCR avec les tags attendus.
    - D'avoir un fichier `.env` de production sur le serveur.
    - D'exécuter `docker compose -f docker-compose.prod.yml pull` pour tirer les images.
    - D'exécuter `docker compose -f docker-compose.prod.yml up -d`.
    - De vérifier que les services démarrent et que le site est accessible via Traefik sur le domaine de production.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.
- **Docker Compose Execution (Prod-like):**
  - La commande `docker compose -f docker-compose.prod.yml up -d` (après un `pull`) doit démarrer tous les services en utilisant les images spécifiées (pas de build local).
  - `docker ps` doit montrer les services en cours d'exécution avec les bonnes images.
- **Service Accessibility (Prod-like):**
  - Le site doit être accessible via le domaine de production configuré pour Traefik, en HTTPS, avec un certificat Let's Encrypt valide.
  - Le dashboard Traefik doit être inaccessible ou correctement sécurisé.
  - Aucune exposition de port non désirée.
- **Restart Policy:**
  - Tester le redémarrage d'un service (ex: `docker stop backend_container_name`) et vérifier qu'il redémarre automatiquement.
- _(Hint: Voir `docs/strategie-tests.md` et `docs/operations/runbook.md`)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
- **Change Log:**
  - Initial Draft