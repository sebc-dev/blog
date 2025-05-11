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
│   ├── README.md               # Ce fichier: docs/project-structure.md
│   ├── architecture/
│   │   ├── architecture-principale.md
│   │   ├── tech-stack.md
│   │   ├── data-models.md
│   │   └── api-reference.md
│   ├── bilinguisme/
│   │   └── gestion-contenu.md
│   ├── ci-cd/
│   │   └── pipeline.md
│   ├── contribution/
│   │   └── normes-codage.md
│   ├── observabilite/
│   │   └── strategie-observabilite.md
│   ├── operations/
│   │   └── runbook.md
│   ├── setup/
│   │   ├── environnement-dev.md
│   │   └── environnement-vars.md
│   ├── tests/
│   │   └── strategie-tests.md
│   ├── ui-ux/
│   │   └── ui-ux-spec.md
│   ├── epic1.md
│   ├── epic2.md
│   ├── ... (autres fichiers epic et PRD)
│   └── prd-blog-bilingue.txt
├── frontend/                   # Code source de l'application frontend Astro
│   ├── public/                 # Fichiers statiques (favicon, robots.txt, images globales)
│   │   └── assets/
│   │       └── images/
│   ├── src/
│   │   ├── assets/             # Assets spécifiques au build (CSS global non Tailwind, polices locales)
│   │   ├── components/         # Composants Astro/UI réutilisables
│   │   │   ├── common/         # Composants très génériques (boutons, cartes)
│   │   │   │   └── LanguageSwitcher.astro
│   │   │   └── article/        # Composants spécifiques aux articles
│   │   │       ├── ArticleToc.astro
│   │   │       ├── CodeBlock.astro
│   │   │       └── ShareButtons.astro
│   │   ├── content/            # Collections de contenu MDX (articles de blog)
│   │   │   ├── blog/           # Collection 'blog'
│   │   │   │   ├── en/         # Articles en anglais
│   │   │   │   │   └── my-first-post.mdx
│   │   │   │   └── fr/         # Articles en français
│   │   │   │       └── mon-premier-article.mdx
│   │   │   └── config.ts       # Configuration des collections Astro (schemas, etc.)
│   │   ├── env.d.ts            # Définitions de types pour les variables d'environnement
│   │   ├── layouts/            # Composants de layout Astro
│   │   │   └── BaseLayout.astro
│   │   ├── lib/                # Fonctions utilitaires, clients API
│   │   │   ├── apiService.ts   # Fonctions pour appeler le backend
│   │   │   └── i18nUtils.ts    # Utilitaires pour l'internationalisation
│   │   ├── pages/              # Structure des pages et routes Astro
│   │   │   ├── en/             # Pages en anglais
│   │   │   │   ├── about.astro
│   │   │   │   └── blog/
│   │   │   │       ├── [slug].astro # Page dynamique pour afficher un article
│   │   │   │       └── index.astro  # Liste des articles en anglais
│   │   │   ├── fr/             # Pages en français
│   │   │   │   ├── a-propos.astro
│   │   │   │   └── blog/
│   │   │   │       ├── [slug].astro
│   │   │   │       └── index.astro
│   │   │   ├── 404.astro
│   │   │   └── index.astro     # Page d'accueil principale (pourrait rediriger ou être une landing)
│   │   └── styles/             # Styles globaux (si nécessaire en plus de Tailwind)
│   │       └── global.css
│   ├── tests/                  # Tests pour le frontend
│   │   ├── e2e/                # Tests End-to-End avec Cypress
│   │   │   └── *.cy.ts
│   │   └── unit/               # Tests unitaires avec Vitest
│   │       └── *.test.ts
│   ├── astro.config.mjs        # Configuration d'Astro
│   ├── package.json            # Dépendances et scripts PNPM pour le frontend
│   ├── pnpm-lock.yaml          # Fichier de lock PNPM
│   ├── tsconfig.json           # Configuration TypeScript pour Astro
│   ├── tailwind.config.cjs     # Configuration de TailwindCSS
│   ├── postcss.config.cjs      # Configuration de PostCSS (utilisé par Tailwind)
│   └── Dockerfile              # Instructions pour builder l'image Docker du frontend
├── scripts/                    # Scripts utilitaires divers (ex: setup local, déploiement)
│   └── deploy-vps.sh           # Exemple de script de déploiement
├── .editorconfig               # Configuration pour la cohérence de style entre éditeurs
├── .env.example                # Fichier d'exemple pour les variables d'environnement globales
├── .gitignore                  # Fichiers et dossiers à ignorer par Git
├── docker-compose.yml          # Configuration Docker Compose pour la production et autres environnements
├── docker-compose.override.yml # Configuration Docker Compose pour le développement local (optionnel)
└── README.md                   # README principal du projet
````

## Descriptions des Répertoires Clés

- **`.github/`**: Contient les workflows GitHub Actions pour l'intégration continue (CI) et le déploiement continu (CD).
    - `workflows/`: Définitions des pipelines pour le frontend et le backend.
- **`backend/`**: Projet Spring Boot (Maven).
    - `src/main/java/fr/kalifazzia/blogtechnique/`: Code source principal de l'application Java.
        - `config/`: Classes de configuration Spring (sécurité, beans, etc.).
        - `metrics/`: Module spécifique à la gestion des métriques des articles (contrôleurs, services, entités JPA, DTOs, repositories). Suivant une approche par fonctionnalité.
        - `shared/`: Classes utilitaires ou DTOs partagés globalement au sein du backend (ex: gestionnaires d'exceptions globaux, DTOs d'erreur).
    - `src/main/resources/`: Fichiers de ressources.
        - `application.yml`: Configuration centrale de Spring Boot.
        - `db/changelog/`: Scripts de migration de base de données Liquibase.
    - `src/test/java/fr/kalifazzia/blogtechnique/`: Tests unitaires et d'intégration pour le backend.
    - `pom.xml`: Descripteur de projet Maven, gère les dépendances et le build.
    - `Dockerfile`: Définit comment construire l'image Docker pour l'application backend.
- **`docs/`**: Toute la documentation du projet (architecture, normes, guides, etc.).
- **`frontend/`**: Projet Astro (PNPM).
    - `public/`: Fichiers statiques copiés tels quels dans le build final (ex: `favicon.ico`, `robots.txt`).
    - `src/`: Code source principal du site Astro.
        - `assets/`: Fichiers traités par le build d'Astro (images optimisées, CSS global).
        - `components/`: Composants Astro réutilisables (`.astro`, `.tsx`, `.jsx`).
        - `content/`: Collections de contenu, principalement les articles de blog en format MDX, organisés par langue.
            - `config.ts`: Définition des schémas pour les collections de contenu Astro.
        - `layouts/`: Mises en page globales pour les pages Astro.
        - `lib/`: Code TypeScript/JavaScript utilitaire (ex: appels API, helpers i18n).
        - `pages/`: Fichiers qui définissent les routes du site, organisés par langue.
        - `styles/`: Fichiers CSS globaux ou feuilles de style non gérées par Tailwind directement.
    - `tests/`:
        - `e2e/`: Tests de bout-en-bout (Cypress).
        - `unit/`: Tests unitaires (Vitest).
    - `astro.config.mjs`: Fichier de configuration principal d'Astro.
    - `package.json`: Manifeste du projet Node.js, gère les dépendances frontend avec PNPM.
    - `pnpm-lock.yaml`: Fichier de lock pour des builds déterministes avec PNPM.
    - `tsconfig.json`: Configuration du compilateur TypeScript.
    - `tailwind.config.cjs`: Configuration de TailwindCSS.
    - `Dockerfile`: Définit comment construire l'image Docker pour le site statique Astro (généralement avec un serveur Nginx ou Caddy pour servir les fichiers).
- **`scripts/`**: Scripts d'aide pour diverses tâches (déploiement, setup, etc.).
- **Fichiers à la racine :**
    - `.editorconfig`, `.gitignore`: Configuration standard de projet.
    - `.env.example`: Modèle pour les variables d'environnement.
    - `docker-compose.yml`: Orchestration des services Docker pour la production et potentiellement d'autres environnements.
    - `docker-compose.override.yml`: Surcharges pour l'environnement de développement local (non versionné par défaut, mais sa structure peut être définie ici).
    - `README.md`: Instructions générales pour le projet.

## Notes sur la Structure du Backend (Spring Boot)

La structure des packages du backend (`fr.kalifazzia.blogtechnique`) est organisée par **module fonctionnel** (ex: `metrics`). À l'intérieur de chaque module fonctionnel, les classes sont ensuite organisées par **couche technique** (ex: `controller`, `service`, `entity`, `repository`, `dto`).

- **`config`**: Contient les configurations globales de Spring (sécurité, JPA, Web MVC, etc.).
- **`metrics` (exemple de module fonctionnel)**:
    - `controller`: Points d'entrée de l'API REST (annotés avec `@RestController`).
    - `dto`: Data Transfer Objects, utilisés pour les payloads des requêtes et les corps des réponses API.
    - `entity`: Entités JPA représentant les tables de la base de données (annotées avec `@Entity`).
    - `repository`: Interfaces Spring Data JPA pour l'accès aux données (étendant `JpaRepository` ou similaire).
    - `service`: Contient la logique métier, orchestre les appels aux repositories et autres services.
- **`shared`**:
    - `exception`: Gestionnaires d'exceptions globaux (`@ControllerAdvice`) et exceptions personnalisées.
    - `dto`: DTOs globaux comme `ErrorResponse`.

Cette structure vise à offrir une bonne séparation des préoccupations tout en maintenant une cohésion élevée au sein des modules fonctionnels.

## Change Log

|   |   |   |   |   |
|---|---|---|---|---|
|**Change**|**Date**|**Version**|**Description**|**Author**|
|Initial draft|2025-05-11|0.1|Création initiale de la structure du projet.|3 - Architecte (IA)|
|Update|2025-05-11|0.2|Modification du package racine backend pour `fr.kalifazzia.blogtechnique`.|3 - Architecte (IA) & Utilisateur|
