# Blog Technique Bilingue - Structure du Projet

Ce document décrit l'organisation des dossiers et des fichiers pour le projet "Blog Technique Bilingue". Une structure claire et cohérente est essentielle pour la maintenabilité, la collaboration et la compréhension du projet par les développeurs et les agents IA.

## Représentation Globale de la Structure (Monorepo)

Nous adoptons une approche monorepo pour gérer le frontend et le backend au sein d'un seul dépôt Git.

```plaintext
blog-technique-bilingue/
├── .github/                    # Workflows GitHub Actions (CI/CD)
│   └── workflows/
│       ├── ci-cd-frontend.yml  # Pipeline pour le frontend Astro
│       └── ci-cd-backend.yml   # Pipeline pour le backend Spring Boot
├── .husky/                     # Hooks Git (ex: pre-commit)
├── .vscode/                    # Paramètres spécifiques à VSCode (optionnel)
│   └── settings.json
├── backend/                    # Code source de l'application backend Spring Boot
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── fr/
│   │   │   │       └── kalifazzia/
│   │   │   │           └── blogtechnique/  # Package racine
│   │   │   │               ├── BlogTechniqueApplication.java
│   │   │   │               ├── config/          # Configurations Spring (sécurité, JPA, etc.)
│   │   │   │               │   ├── JpaAuditingConfig.java
│   │   │   │               │   └── WebConfig.java # CORS, etc.
│   │   │   │               ├── metrics/         # Module pour la gestion des métriques
│   │   │   │               │   ├── controller/
│   │   │   │               │   │   └── ArticleMetricsController.java
│   │   │   │               │   ├── dto/
│   │   │   │               │   │   ├── ArticleFeedbackPayload.java
│   │   │   │               │   │   └── FeedbackVote.java
│   │   │   │               │   ├── entity/
│   │   │   │               │   │   └── ArticleVersionMetric.java
│   │   │   │               │   ├── repository/
│   │   │   │               │   │   └── ArticleVersionMetricRepository.java
│   │   │   │               │   └── service/
│   │   │   │               │       └── ArticleMetricsService.java
│   │   │   │               └── shared/          # Code partagé (DTOs globaux, exceptions, etc.)
│   │   │   │                   ├── exception/
│   │   │   │                   │   ├── GlobalExceptionHandler.java
│   │   │   │                   │   └── ResourceNotFoundException.java
│   │   │   │                   └── dto/
│   │   │   │                       └── ErrorResponse.java
│   │   │   └── resources/
│   │   │       ├── application.yml       # Configuration principale Spring Boot
│   │   │       ├── application-dev.yml   # Profil de développement (si besoin)
│   │   │       ├── application-prod.yml  # Profil de production (si besoin)
│   │   │       ├── db/
│   │   │       │   └── changelog/        # Scripts de migration Liquibase
│   │   │       │       ├── db.changelog-master.xml
│   │   │       │       └── changes/
│   │   │       │           └── 001-create-article-version-metrics-table.sql
│   │   └── test/
│   │       └── java/
│   │           └── fr/
│   │               └── kalifazzia/
│   │                   └── blogtechnique/
│   │                       ├── BlogTechniqueApplicationTests.java
│   │                       └── metrics/
│   │                           ├── controller/
│   │                           │   └── ArticleMetricsControllerTest.java
│   │                           └── service/
│   │                               └── ArticleMetricsServiceTest.java
│   ├── pom.xml                 # Fichier de configuration Maven
│   └── Dockerfile              # Instructions pour builder l'image Docker du backend
├── docs/                       # Documentation du projet (PRD, Architecture, etc.)
│   ├── architecture/           # Documentation sur l'architecture du projet
│   ├── bilinguisme/            # Documentation sur la gestion du contenu bilingue
│   ├── ci-cd/                  # Documentation sur les pipelines d'intégration et déploiement continus
│   ├── contribution/           # Guides et normes pour les contributeurs
│   ├── cursor/                 # Documentation spécifique à l'utilisation de Cursor
│   ├── observabilite/          # Stratégies d'observabilité et monitoring
│   ├── operations/             # Guides opérationnels et runbooks
│   ├── securite/               # Documentation sur la sécurité du projet
│   ├── seo/                    # Stratégies et bonnes pratiques SEO
│   ├── setup/                  # Guides d'installation et configuration
│   ├── specs/                  # Spécifications fonctionnelles par épopée
│   │   ├── epic1/              # Documents relatifs à l'épopée 1
│   │   ├── epic2/              # Documents relatifs à l'épopée 2
│   │   ├── epic3/              # Documents relatifs à l'épopée 3
│   │   ├── epic4/              # Documents relatifs à l'épopée 4
│   │   ├── epic5/              # Documents relatifs à l'épopée 5
│   │   ├── epic6/              # Documents relatifs à l'épopée 6
│   │   └── epic7/              # Documents relatifs à l'épopée 7
│   ├── tests/                  # Stratégies et documentation de tests
│   └── ui-ux/                  # Spécifications d'interface utilisateur et expérience utilisateur
│       └── ui-ux-spec.md
├── prd-blog-bilingue.md        # Product Requirements Document
├── project-structure.md        # Structure du projet
├── frontend/                   # Code source de l'application frontend Astro
│   ├── public/                 # Fichiers statiques (favicon, robots.txt, images globales)
│   │   └── assets/
│   │       └── images/
│   │   ├── src/
│   │   │   ├── assets/             # Assets spécifiques au build (CSS global non Tailwind, polices locales)
│   │   │   ├── components/         # Composants Astro/UI réutilisables
│   │   │   │   ├── common/         # Composants très génériques (boutons, cartes)
│   │   │   │   │   └── LanguageSwitcher.astro
│   │   │   │   └── article/        # Composants spécifiques aux articles
│   │   │   │       ├── ArticleToc.astro
│   │   │   │       ├── CodeBlock.astro
│   │   │   │       └── ShareButtons.astro
│   │   │   ├── content/            # Collections de contenu MDX (articles de blog)
│   │   │   │   ├── blog/           # Collection 'blog'
│   │   │   │   │   ├── en/         # Articles en anglais
│   │   │   │   │   │   └── my-first-post.mdx
│   │   │   │   │   └── fr/         # Articles en français
│   │   │   │   │   │   └── mon-premier-article.mdx
│   │   │   │   │   └── config.ts       # Configuration des collections Astro (schemas, etc.)
│   │   │   │   ├── env.d.ts            # Définitions de types pour les variables d'environnement
│   │   │   │   ├── layouts/            # Composants de layout Astro
│   │   │   │   │   └── BaseLayout.astro
│   │   │   │   ├── lib/                # Fonctions utilitaires, clients API
│   │   │   │   │   ├── apiService.ts   # Fonctions pour appeler le backend
│   │   │   │   │   └── i18nUtils.ts    # Utilitaires pour l'internationalisation
│   │   │   │   ├── pages/              # Structure des pages et routes Astro
│   │   │   │   │   ├── en/             # Pages en anglais
│   │   │   │   │   │   ├── about.astro
│   │   │   │   │   │   └── blog/
│   │   │   │   │   │   │   ├── [slug].astro # Page dynamique pour afficher un article
│   │   │   │   │   │   │   └── index.astro  # Liste des articles en anglais
│   │   │   │   │   │   ├── fr/             # Pages en français
│   │   │   │   │   │   │   ├── a-propos.astro
│   │   │   │   │   │   │   └── blog/
│   │   │   │   │   │   │   │   ├── [slug].astro
│   │   │   │   │   │   │   └── index.astro
│   │   │   │   │   │   └── 404.astro
│   │   │   │   │   └── index.astro     # Page d'accueil principale (pourrait rediriger ou être une landing)
│   │   └── styles/             # Styles globaux (si nécessaire en plus de Tailwind)
│   │       └── global.css      # Fichier CSS principal avec imports et config TailwindCSS v4 et DaisyUI v5
│   ├── test/                  # Tests pour le frontend
│   │   └── unit/              # Tests unitaires avec Vitest
│   │       └── basic.test.ts
│   ├── astro.config.ts        # Configuration d'Astro avec plugin tailwindcss/vite
│   ├── package.json            # Dépendances et scripts PNPM pour le frontend
│   ├── pnpm-lock.yaml          # Fichier de lock PNPM
│   ├── tsconfig.json           # Configuration TypeScript pour Astro
│   ├── vitest.config.ts       # Configuration Vitest pour les tests unitaires
│   └── Dockerfile              # Instructions pour builder l'image Docker du frontend
├── scripts/                    # Scripts utilitaires divers (ex: setup local, déploiement)
│   └── deploy-vps.sh           # Exemple de script de déploiement
├── .editorconfig               # Configuration pour la cohérence de style entre éditeurs
├── .env.example                # Fichier d'exemple pour les variables d'environnement globales
├── .gitignore                  # Fichiers et dossiers à ignorer par Git
├── infra/                      # Configurations d'infrastructure pour le développement
│   ├── proxy/                  # Configuration Traefik pour le développement
│   │   └── docker-compose.yml
│   └── site/                   # Configuration pour Astro, Spring Boot et PostgreSQL (dev)
│       └── docker-compose.yml
└── README.md                   # README principal du projet
```

## Descriptions des Répertoires Clés

-   **`.github/`**: Contient les workflows GitHub Actions pour l'intégration continue (CI) et le déploiement continu (CD).
    -   `workflows/`: Définitions des pipelines pour le frontend et le backend.
-   **`backend/`**: Projet Spring Boot (Maven).
    -   `src/main/java/fr/kalifazzia/blogtechnique/`: Code source principal de l'application Java.
        -   `config/`: Classes de configuration Spring (sécurité, beans, etc.).
        -   `metrics/`: Module spécifique à la gestion des métriques des articles (contrôleurs, services, entités JPA, DTOs, repositories). Suivant une approche par fonctionnalité.
        -   `shared/`: Classes utilitaires ou DTOs partagés globalement au sein du backend (ex: gestionnaires d'exceptions globaux, DTOs d'erreur).
    -   `src/main/resources/`: Fichiers de ressources.
        -   `application.yml`: Configuration centrale de Spring Boot.
        -   `db/changelog/`: Scripts de migration de base de données Liquibase.
    -   `src/test/java/fr/kalifazzia/blogtechnique/`: Tests unitaires et d'intégration pour le backend.
    -   `pom.xml`: Descripteur de projet Maven, gère les dépendances et le build.
    -   `Dockerfile`: Définit comment construire l'image Docker pour l'application backend.
-   **`docs/`**: Toute la documentation du projet (architecture, normes, guides, etc.).
    -   `architecture/`: Documentation sur l'architecture technique du projet.
    -   `bilinguisme/`: Guides et stratégies pour la gestion du contenu bilingue.
    -   `ci-cd/`: Configuration et documentation des pipelines CI/CD.
    -   `contribution/`: Normes et guides pour les contributeurs au projet.
    -   `cursor/`: Documentation sur l'utilisation de l'IDE Cursor pour ce projet.
    -   `observabilite/`: Stratégies pour le monitoring et l'observabilité.
    -   `operations/`: Runbooks et procédures opérationnelles.
    -   `securite/`: Documentation sur la sécurité du projet.
    -   `seo/`: Stratégies et bonnes pratiques d'optimisation pour les moteurs de recherche.
    -   `setup/`: Guides d'installation et de configuration des environnements.
    -   `specs/`: Spécifications fonctionnelles organisées par épopées (epics).
    -   `tests/`: Stratégies et documentation sur les approches de test.
    -   `ui-ux/`: Spécifications et guidelines pour l'interface et l'expérience utilisateur.
-   **`frontend/`**: Projet Astro (PNPM).
    -   `public/`: Fichiers statiques copiés tels quels dans le build final (ex: `favicon.ico`, `robots.txt`).
    -   `src/`: Code source principal du site Astro.
        -   `assets/`: Fichiers traités par le build d'Astro (images optimisées, CSS global).
        -   `components/`: Composants Astro réutilisables (`.astro`, `.tsx`, `.jsx`).
        -   `content/`: Collections de contenu, principalement les articles de blog en format MDX, organisés par langue.
            -   `config.ts`: Définition des schémas pour les collections de contenu Astro.
        -   `layouts/`: Mises en page globales pour les pages Astro.
        -   `lib/`: Code TypeScript/JavaScript utilitaire (ex: appels API, helpers i18n).
        -   `pages/`: Fichiers qui définissent les routes du site, organisés par langue.
        -   `styles/`: Fichiers CSS globaux ou feuilles de style non gérées par Tailwind directement.
    -   `test/`:
        -   `unit/`: Tests unitaires (Vitest).
    -   `astro.config.ts`: Fichier de configuration principal d'Astro avec plugin tailwindcss/vite.
    -   `package.json`: Manifeste du projet Node.js, gère les dépendances frontend avec PNPM.
    -   `pnpm-lock.yaml`: Fichier de lock pour des builds déterministes avec PNPM.
    -   `tsconfig.json`: Configuration du compilateur TypeScript.
    -   `vitest.config.ts`: Configuration Vitest pour les tests unitaires.
    -   `Dockerfile`: Définit comment construire l'image Docker pour le site statique Astro (généralement avec un serveur Nginx ou Caddy pour servir les fichiers).
-   **`infra/`**: Contient les fichiers de configuration Docker Compose pour le développement local uniquement.
    -   `proxy/`: Configuration de Traefik pour le développement.
    -   `site/`: Configuration de la stack Astro + Spring Boot + PostgreSQL pour le développement.
-   **`scripts/`**: Scripts d'aide pour diverses tâches (déploiement, setup, etc.).
-   **Fichiers à la racine :**
    -   `.editorconfig`, `.gitignore`: Configuration standard de projet.
    -   `.env.example`: Modèle pour les variables d'environnement.
    -   `README.md`: Instructions générales pour le projet.

## Structure de Déploiement VPS (Production)

Pour l'environnement de production, une structure basée sur le répertoire `/srv/docker/` est utilisée sur le VPS :

```plaintext
/srv/docker/
├── proxy/                       # Configuration Traefik (entrée unique 80/443)
│   ├── docker-compose.yml       # version production
│   ├── .env                     # Variables pour Traefik
│   └── traefik_data/            # Données Traefik
├── postgre/                     # Configuration PostgreSQL indépendante
│   ├── docker-compose.yml       # Configuration du service PostgreSQL
│   ├── .env                     # Variables non sensibles (DB_NAME, etc.)
│   └── secrets/                 # Gestion des secrets Docker
│       ├── postgres_user.txt    # Nom d'utilisateur (chmod 600)
│       └── postgres_password.txt # Mot de passe (chmod 600)
├── apps/
│   └── site/                    # Configuration Astro + Spring Boot
│       ├── docker-compose.prod.yml # Production compose file
│       ├── .env                 # Variables d'environnement
│       └── data/                # Données persistantes
└── backups/                     # Sauvegardes
```

Cette séparation des services, en particulier pour PostgreSQL dans son propre répertoire `/srv/docker/postgre/`, permet une meilleure modularité, une gestion indépendante et sécurisée des secrets (avec Docker Secrets), et une maintenance plus facile.

## Notes sur la Structure du Backend (Spring Boot)

La structure des packages du backend (`fr.kalifazzia.blogtechnique`) est organisée par **module fonctionnel** (ex: `metrics`). À l'intérieur de chaque module fonctionnel, les classes sont ensuite organisées par **couche technique** (ex: `controller`, `service`, `entity`, `repository`, `dto`).

-   **`config`**: Contient les configurations globales de Spring (sécurité, JPA, Web MVC, etc.).
-   **`metrics` (exemple de module fonctionnel)**:
    -   `controller`: Points d'entrée de l'API REST (annotés avec `@RestController`).
    -   `dto`: Data Transfer Objects, utilisés pour les payloads des requêtes et les corps des réponses API.
    -   `entity`: Entités JPA représentant les tables de la base de données (annotées avec `@Entity`).
    -   `repository`: Interfaces Spring Data JPA pour l'accès aux données (étendant `JpaRepository` ou similaire).
    -   `service`: Contient la logique métier, orchestre les appels aux repositories et autres services.
-   **`shared`**:
    -   `exception`: Gestionnaires d'exceptions globaux (`@ControllerAdvice`) et exceptions personnalisées.
    -   `dto`: DTOs globaux comme `ErrorResponse`.

Cette structure vise à offrir une bonne séparation des préoccupations tout en maintenant une cohésion élevée au sein des modules fonctionnels.

## Change Log

|               |            |     |                                                                                       |                                   |
| ------------- | ---------- | --- | ------------------------------------------------------------------------------------- | --------------------------------- |
| Initial draft | 2025-05-11 | 0.1 | Création initiale de la structure du projet.                                          | 3 - Architecte (IA)               |
| Update        | 2025-05-11 | 0.2 | Modification du package racine backend pour `fr.kalifazzia.blogtechnique`.            | 3 - Architecte (IA) & Utilisateur |
| Update        | 2023-11-04 | 0.3 | Mise à jour de la structure du dossier docs pour refléter l'organisation actuelle.    | Utilisateur                       |
| Update        | 2025-05-15 | 0.4 | Ajout de la structure de déploiement VPS avec PostgreSQL dans `/srv/docker/postgre/`. | Architecte (IA)                   |
