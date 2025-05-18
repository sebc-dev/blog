# Blog Technique Bilingue – Structure du Projet (**révision deployment-ready**)

Ce document décrit :

1. **L'arborescence du dépôt Git (monorepo)** – inchangée pour la partie code.
2. **L'arborescence de déploiement sur le VPS OVH** – nouvelle section intégrée selon la stratégie `/srv/docker` proposée.
3. Les ajustements CI/CD (images pré-construites poussées sur GitHub Container Registry).

---

## 1. Représentation globale du dépôt (monorepo)

```plaintext
blog-technique-bilingue/
├── .github/
│   └── workflows/
│       ├── build-push.yml       # Build & push images vers GHCR
│       └── deploy.yml           # Déploiement SSH vers le VPS
├── backend/                     # Spring Boot (voir §3)
├── frontend/                    # Astro (voir §3)
├── infra/                       # Fichiers Compose *développement*
│   ├── proxy/                   # Traefik (dev)
│   │   └── docker-compose.yml
│   └── site/                    # Stack Astro + Spring + PostgreSQL (dev)
│       └── docker-compose.yml
├── docs/ …                      # Documentation (inchangé)
├── scripts/ …
├── .editorconfig
├── .env.example
├── .gitignore
└── README.md
```

_Changement majeur :_ **le dépôt ne contient plus de `docker-compose.yml` racine « tout-en-un »**.
Chaque stack dispose d'un fichier Compose dédié placé **dans son propre dossier** ; Compose dérive ainsi automatiquement le _project name_ à partir du nom du dossier, ce qui évite toute collision de ressources (containers, volumes, réseaux). ([Docker Documentation][1], [Docker Community Forums][2])

---

## 2. Arborescence de déploiement sur le VPS OVH

Les artefacts Docker sont construits par GitHub Actions, poussés sur GHCR puis déployés via SSH dans la structure serveur suivante :

```plaintext
/srv
└── docker
    ├── proxy/                       # ⇢ Traefik (entrée unique 80/443)
    │   ├── docker-compose.yml       # version *production*
    │   ├── .env                     # TRAEFIK_* vars
    │   └── traefik_data/
    │       ├── traefik.yml
    │       └── acme.json            # certs (chmod 600, hors Git)
    ├── postgre/                     # ⇢ PostgreSQL
    │   ├── docker-compose.yml       # configuration PostgreSQL
    │   ├── .env                     # POSTGRES_DB, etc. (variables non-sensibles)
    │   └── secrets/                 # fichiers de secrets (credentials)
    │       ├── postgres_user.txt    # nom d'utilisateur (chmod 600)
    │       └── postgres_password.txt # mot de passe (chmod 600)
    ├── apps/
    │   └── site/                    # ⇢ Astro + Spring
    │       ├── docker-compose.prod.yml
    │       ├── .env                 # variables d'environnement
    │       └── data/                # uploads, dumps éventuels
    └── backups/                     # dépôt Restic/Borg (hors Git)
```

_Justification `/srv`_ : le FHS réserve ce répertoire aux **données servies par le système** (HTTP, FTP, VCS, etc.) ; placer vos stacks ici respecte la convention et simplifie la sauvegarde. ([Wikipédia][3], [tldp.org][4])

_Justification `/srv/docker/postgre/`_ : Séparer le service PostgreSQL dans son propre répertoire permet une meilleure modularité et une gestion indépendante des configurations, secrets et volumes. Cela facilite la maintenance et suit les bonnes pratiques de séparation des services.

### Réseaux Docker

| Nom            | Type (Docker) | Portée / rôle                                 |
| -------------- | ------------- | --------------------------------------------- |
| `webproxy_net` | _externe_     | Trafic HTTPS entre Traefik et chaque service. |
| `site_net`     | _interne_     | Dialogue Spring ⇄ PostgreSQL (non exposé).    |

---

## 3. Synthèse des modules (back-/front-/infra)

| Module       | Build local ?             | Image push GHCR                | Fichier Compose _prod_                          | Port exposé  |
| ------------ | ------------------------- | ------------------------------ | ----------------------------------------------- | ------------ |
| **Traefik**  | Non (image officielle)    | N/A                            | `/srv/docker/proxy/docker-compose.yml`          | 80/443       |
| **Astro**    | Oui (`astro/Dockerfile`)  | `ghcr.io/org/site-astro:<tag>` | `/srv/docker/apps/site/docker-compose.prod.yml` | interne 8080 |
| **Spring**   | Oui (`spring/Dockerfile`) | `ghcr.io/org/site-api:<tag>`   | idem                                            | interne 8080 |
| **Postgres** | Non (image officielle)    | N/A                            | `/srv/docker/postgre/docker-compose.yml`        | interne 5432 |

---

## 4. Flux CI/CD (résumé)

1. **Push d'un tag Git `v1.0.3`**
2. **GitHub Actions**

    - _Job build-push_ : `docker build`, `docker push` vers GHCR.
    - _Job deploy_ : SSH → VPS ; `docker compose pull && up -d` dans chaque dossier.

3. **Traefik** détecte les nouveaux conteneurs via le provider Docker, émet/renouvelle automatiquement les certificats ACME/TLS-ALPN.

---

## 5. Journal des changements (extrait)

| Date       | Ver. | Nature                                                                                    | Auteur                        |
| ---------- | ---- | ----------------------------------------------------------------------------------------- | ----------------------------- |
| 2025-05-15 | 0.5  | Ajout de la structure dédiée pour PostgreSQL dans `/srv/docker/postgre/`                  | Architecte (IA)               |
| 2025-05-15 | 0.4  | Ajout de la section _Arborescence VPS_ et retrait du Compose racine ; adaptation CI GHCR. | Architecte (IA)               |
| 2025-05-11 | 0.3  | MàJ structure `docs/`.                                                                    | Utilisateur                   |
| 2025-05-11 | 0.2  | Package racine backend modifié.                                                           | Architecte (IA) & Utilisateur |
| 2025-05-11 | 0.1  | Version initiale.                                                                         | Architecte (IA)               |

---

**Cette nouvelle version reflète fidèlement la séparation 'code ↔ infra ↔ données' et l'utilisation d'images pré-construites hébergées sur GitHub Container Registry.**

```
::contentReference[oaicite:2]{index=2}
```

[1]: https://docs.docker.com/compose/how-tos/project-name/?utm_source=chatgpt.com "Specify a project name - Docker Docs"
[2]: https://forums.docker.com/t/docker-compose-folder-name-caused-me-much-trouble/135372?utm_source=chatgpt.com "Docker compose folder name caused me much trouble - General"
[3]: https://en.wikipedia.org/wiki/Filesystem_Hierarchy_Standard?utm_source=chatgpt.com "Filesystem Hierarchy Standard"
[4]: https://tldp.org/LDP/Linux-Filesystem-Hierarchy/html/srv.html?utm_source=chatgpt.com "/srv"

## Modifications suite à la branche story6

### 1. Modifications de la structure du projet frontend

La branche story6 a introduit les modifications suivantes dans la structure du projet frontend :

-   Utilisation de `astro.config.ts` au lieu de `astro.config.mjs`
-   Utilisation du plugin `@tailwindcss/vite` au lieu de la configuration traditionnelle avec `tailwind.config.cjs` et `postcss.config.cjs`
-   Configuration de TailwindCSS directement dans `src/styles/global.css` via directives d'import
-   Installation et configuration de `@tailwindcss/typography` comme plugin pour TailwindCSS
-   Installation et configuration de DaisyUI comme plugin pour TailwindCSS
-   Mise en place de Vitest pour les tests unitaires dans le répertoire `test/` au lieu de `tests/`

### 2. Documents impactés

Les documents suivants ont été mis à jour pour refléter ces modifications :

-   `docs/project-structure.md` : Mise à jour de la structure des fichiers frontend
-   `docs/contribution/normes-codage.md` : Mise à jour de la section concernant le plugin `@tailwindcss/typography`
-   `docs/specs/epic1/story6.md` : Mise à jour des tâches d'installation des dépendances et configuration

### 3. Architecture technique actualisée

La stack technique reste conforme à celle définie dans `docs/architecture/teck-stack.md`, mais avec une méthode d'intégration différente pour TailwindCSS :

-   Astro 5.7.13 (conforme à la version spécifiée 5.7.12)
-   TailwindCSS 4.1.7 (conforme à la version spécifiée 4.1.6)
-   DaisyUI 5.0.35 (conforme à la version spécifiée)
-   `@tailwindcss/typography` 0.5.16
-   `@tailwindcss/vite` 4.1.7 (intégration avec Astro)

Cette approche simplifie l'intégration de TailwindCSS avec Astro en utilisant le plugin Vite officiel plutôt que la configuration traditionnelle.

### 4. Impacts sur les développeurs

Pour les développeurs travaillant sur le projet, ces modifications impliquent :

-   L'utilisation de `@import "tailwindcss";` au lieu des directives standards dans les fichiers CSS
-   L'utilisation de plugins via la syntaxe `@plugin "nom-du-plugin";` dans les fichiers CSS
-   La configuration de TailwindCSS se fait via le plugin Vite dans `astro.config.ts` et non plus via un fichier de configuration séparé
-   La structure des tests a été simplifiée, avec un focus sur les tests unitaires avec Vitest

## Modifications suite à la branche story7

### 1. Configuration CSS-first pour TailwindCSS v4 et DaisyUI v5

La branche story7 a apporté les modifications suivantes dans la configuration des thèmes et des styles :

-   Adoption complète de l'approche "CSS-first" de TailwindCSS v4 et DaisyUI v5
-   Configuration des thèmes DaisyUI directement dans le fichier CSS via `@plugin "daisyui"` avec définition des thèmes clairs et sombres
-   Mise en place des polices de caractères "Inter" et "JetBrains Mono" via `@theme` dans le CSS
-   Personnalisation du plugin `@tailwindcss/typography` avec des surcharges CSS utilisant les variables de thème DaisyUI
-   Implémentation d'un sélecteur de thème avec persistance des préférences via `localStorage`

### 2. Avantages de l'approche CSS-first

Cette nouvelle approche offre plusieurs avantages :

-   Centralisation de la configuration dans les fichiers CSS (au lieu de fichiers JavaScript)
-   Exploitation native des fonctionnalités CSS modernes (variables CSS, fonctions comme `color-mix()`)
-   Simplification de la structure du projet (suppression de `tailwind.config.js`)
-   Amélioration des performances grâce à la réduction de la dépendance à JavaScript
-   Meilleure intégration avec les mécanismes de thèmes natifs des navigateurs
-   Configuration plus intuitive pour les développeurs front-end

### 3. Documents impactés

Les documents suivants ont été mis à jour pour refléter ces changements :

-   `docs/ui-ux/ui-ux-spec.md` : Mise à jour des informations sur l'implémentation des thèmes et des polices
-   `docs/project-structure.md` : Ajout de précisions sur le rôle du fichier `global.css`
-   `docs/specs/epic1/story7.md` : Documentation détaillée sur la configuration des thèmes DaisyUI v5 avec TailwindCSS v4

### 4. Impact sur le développement

Pour les développeurs, ces changements impliquent :

-   Une meilleure compréhension des mécanismes de personnalisation CSS modernes
-   Un workflow simplifié pour la modification des thèmes (modifications directement dans le CSS)
-   Une transition des configurations JavaScript vers les directives CSS
-   Une approche plus cohérente avec les standards web actuels

### 5. Mise à jour des polices et ressources statiques

Dans le cadre de cette mise à jour :

-   Ajout des polices Inter et JetBrains Mono au format WOFF2 dans `frontend/public/fonts/`
-   Création d'un favicon SVG adaptatif qui change de couleur selon le mode clair/sombre
-   Implémentation du composant `ThemeSwitcher.astro` pour permettre le changement de thème
-   Script anti-FOUC (Flash Of Unstyled Content) pour appliquer le thème dès le chargement initial

### 6. Précisions sur la structure du projet

La structure de fichiers suivante a été mise en place pour la gestion des thèmes et des styles :

```
frontend/
├── public/
│   ├── favicon.svg                # Favicon adaptatif (change de couleur selon le thème)
│   └── fonts/                     # Polices au format WOFF2
│       ├── Inter-Bold.woff2
│       ├── Inter-Regular.woff2
│       ├── JetBrainsMono-*.woff2  # Différents styles/poids
├── src/
│   ├── components/
│   │   └── common/
│   │       └── ThemeSwitcher.astro # Composant de sélection de thème
│   ├── layouts/
│   │   └── BaseLayout.astro       # Layout avec script anti-FOUC
│   └── styles/
│       └── global.css             # Configuration CSS-first
```

Ces modifications respectent les principes établis dans le document `docs/ui-ux/ui-ux-spec.md` concernant l'identité visuelle et les préférences utilisateur.

## Changements cumulatifs

Le passage à TailwindCSS v4 et DaisyUI v5 avec une approche CSS-first représente une évolution significative dans la façon dont le projet gère les styles et les thèmes. Les modifications apportées par les branches story6 et story7 permettent une meilleure séparation des préoccupations, avec :

1. Une configuration simplifiée dans `astro.config.ts` via le plugin Vite de TailwindCSS
2. Une personnalisation complète des thèmes et des polices dans le CSS
3. Une infrastructure de tests moderne avec Vitest
4. Une gestion des préférences utilisateur (thème clair/sombre) plus intuitive

L'ensemble de ces modifications a été documenté dans les spécifications correspondantes et reflété dans la structure du projet mise à jour.
