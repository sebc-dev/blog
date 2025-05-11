# Blog Technique Bilingue - Stratégie de Tests

## Philosophie Générale & Objectifs

Notre approche des tests vise à garantir la qualité, la fiabilité et la non-régression du "Blog Technique Bilingue" à travers une automatisation extensive et ciblée. Nous nous inspirons des principes de la pyramide des tests, en mettant l'accent sur des tests unitaires rapides et nombreux, complétés par des tests d'intégration et des tests de bout-en-bout (E2E) pour les parcours critiques.

-   **Objectif 1 : Qualité et Fiabilité**
    -   Assurer que les fonctionnalités MVP (publication et affichage de contenu bilingue, comptage anonyme des partages et de l'utilité, recherche statique) fonctionnent comme attendu.
    -   Prévenir les régressions lors des évolutions et des refactorings.
-   **Objectif 2 : Confiance dans les Déploiements**
    -   Permettre des déploiements fréquents et automatisés avec un haut degré de confiance grâce à un pipeline CI/CD intégrant les tests.
-   **Objectif 3 : Maintenabilité et Compréhension**
    -   Utiliser les tests comme une forme de documentation vivante du comportement attendu des composants.
    -   Faciliter l'intégration de nouveaux contributeurs (y compris agents IA) grâce à une suite de tests claire.
-   **Objectif 4 : Performance et Accessibilité**
    -   Vérifier les aspects de performance clés (Core Web Vitals).
    -   S'assurer du respect des standards d'accessibilité de base (WCAG 2.1 AA).

## Niveaux de Tests

### Tests Unitaires (TU)

-   **Portée :** Tester les plus petites unités de code de manière isolée.
    -   **Frontend (Astro/TypeScript) :** Fonctions utilitaires dans `src/lib/`, logique interne des composants Astro simples (si applicable et testable unitairement), transformations de données.
    -   **Backend (Spring Boot/Java) :** Logique métier des classes de Service, méthodes des classes utilitaires, validation des DTOs, logique interne des Entités (si des méthodes métier y sont présentes).
-   **Outils :**
    -   **Frontend :** **Vitest** (intégré à l'écosystème Vite/Astro).
    -   **Backend :** **JUnit 5** (via `spring-boot-starter-test`), **Mockito** pour le mocking des dépendances.
-   **Mocking/Stubbing :**
    -   **Frontend :** Mocks de Vitest.
    -   **Backend :** Mockito (`@Mock`, `@InjectMocks`).
-   **Localisation :**
    -   **Frontend :** Fichiers `*.test.ts` ou `*.spec.ts` dans le répertoire `frontend/tests/unit/` ou à proximité des fichiers sources qu'ils testent.
    -   **Backend :** Dans le répertoire `backend/src/test/java/`, en respectant la structure des packages du code source.
-   **Attentes :**
    -   Couverture élevée des fonctions utilitaires et de la logique métier critique.
    -   Exécution très rapide, intégrée aux hooks de pre-commit (via Husky) et à chaque build dans le CI.
    -   Doivent être indépendants de l'infrastructure externe (base de données, API tierces).

### Tests d'Intégration (TI)

-   **Portée :** Vérifier l'interaction entre plusieurs composants ou modules internes.
    -   **Frontend (Astro/TypeScript) :** Interaction entre plusieurs composants Astro sur une page, rendu correct des composants avec des props spécifiques, intégration avec le système de collections de contenu Astro.
    -   **Backend (Spring Boot/Java) :** Interaction entre les couches Controller, Service et Repository. Test des endpoints API avec un contexte Spring Boot complet mais avec une base de données en mémoire (ex: H2) ou des testcontainers pour PostgreSQL. Vérification de la sérialisation/désérialisation JSON.
-   **Outils :**
    -   **Frontend :** **Vitest** avec des utilitaires de test pour composants Astro (ex: `@testing-library/dom` ou des helpers spécifiques si disponibles).
    -   **Backend :** **Spring Boot Test** (`@SpringBootTest`), **JUnit 5**, **Mockito** (pour mocker des dépendances externes si nécessaire), **Testcontainers** (pour PostgreSQL), ou base H2.
-   **Localisation :**
    -   **Frontend :** Fichiers dans `frontend/tests/integration/`.
    -   **Backend :** Dans `backend/src/test/java/`, potentiellement dans des packages dédiés à l'intégration (ex: `fr.kalifazzia.blogtechnique.metrics.controller.integration`).
-   **Attentes :**
    -   Valider les contrats entre les composants.
    -   S'assurer que les appels API backend fonctionnent correctement (parsing des requêtes, génération des réponses, interaction avec la base de données simulée/réelle).
    -   Plus lents que les TU, exécutés principalement dans le pipeline CI/CD.

### Tests de Bout-en-Bout (E2E) / Tests d'Acceptation

-   **Portée :** Tester l'application complète du point de vue de l'utilisateur, en interagissant avec l'UI (frontend) et en vérifiant les flux de données jusqu'au backend réel et à la base de données (dans un environnement de test complet).
    -   Parcours utilisateurs clés :
        -   Navigation sur le site (accueil, pages de listing d'articles, pages d'articles).
        -   Passage d'une langue à l'autre.
        -   Utilisation de la recherche statique (Pagefind).
        -   Interaction avec les boutons de partage social (vérification de l'appel API backend).
        -   Interaction avec les boutons "article utile Oui/Non" (vérification de l'appel API backend).
        -   Vérification de la présentation correcte du contenu (MDX, code, images).
-   **Outils :** **Cypress** (comme spécifié dans `teck-stack.txt` et `prd-blog-bilingue.txt`).
-   **Environnement :** Exécutés contre une instance de l'application déployée dans un environnement de test dédié (idéalement un environnement de staging post-MVP, ou un environnement local complet construit via Docker Compose pour le CI).
-   **Localisation :** Fichiers dans `frontend/tests/e2e/` (Cypress opère depuis le contexte du frontend).
-   **Attentes :**
    -   Couvrir les fonctionnalités les plus critiques et les parcours utilisateurs principaux.
    -   Plus lents et potentiellement plus instables que les autres types de tests.
    -   Exécutés dans le pipeline CI/CD, possiblement moins fréquemment (ex: après un déploiement réussi sur un environnement de test, ou en nightly build).

## Types de Tests Spécialisés

### Tests de Performance

-   **Portée & Objectifs (MVP) :**
    -   Mesure des Core Web Vitals (LCP, FID, CLS) sur les pages clés.
    -   Objectif : LCP < 2.5s.
    -   Vérifier la taille des assets (images, JS).
-   **Outils :**
    -   Intégration de Lighthouse dans le pipeline CI/CD (via des actions GitHub ou des scripts).
    -   Utilisation des outils de développement des navigateurs pour analyse manuelle.
-   **(Post-MVP) Tests de Charge API :** Si le trafic augmente significativement, des tests de charge pour l'API backend (avec des outils comme K6 ou JMeter) seront envisagés.

### Tests de Sécurité

-   **Portée & Objectifs :**
    -   Analyse des vulnérabilités des dépendances (SCA).
    -   Analyse statique de la sécurité du code (SAST) basique.
    -   Analyse des images Docker.
-   **Outils :**
    -   **PNPM Audit / Maven Dependency-Check / Snyk** (pour les dépendances).
    -   **Trivy** (pour les images Docker, intégré au CI/CD).
    -   Linters de sécurité ESLint/Checkstyle si des plugins pertinents existent.
-   **Processus :** Intégrés au pipeline CI/CD. Les vulnérabilités critiques doivent bloquer le build.

### Tests d'Accessibilité (UI)

-   **Portée & Objectifs (MVP) :**
    -   Respect des standards WCAG 2.1 Niveau AA pour les fonctionnalités de base.
    -   Navigation au clavier, contrastes de couleurs, alternatives textuelles pour les images.
-   **Outils :**
    -   **Axe Core** (peut être intégré avec Cypress pour les tests E2E).
    -   Lighthouse (section accessibilité).
    -   Vérifications manuelles pour certains aspects.
-   **Processus :** Tests automatisés dans le CI et vérifications manuelles périodiques.

### Tests de Régression Visuelle (UI)

-   **Portée & Objectifs (MVP) :**
    -   Prévenir les modifications visuelles involontaires sur les composants clés et les mises en page principales.
-   **Outils :**
    -   Des outils comme Percy, Applitools, ou les capacités de comparaison visuelle de Playwright (si Cypress s'avère limité ou si on migre) pourraient être envisagés post-MVP. Pour le MVP, cela peut être plus manuel ou basé sur des snapshots simples si les outils le permettent facilement.
    -   Cypress peut prendre des captures d'écran, mais la comparaison avancée nécessite des outils tiers ou une logique personnalisée.
-   **Processus (MVP) :** Captures d'écran manuelles ou automatisées basiques lors des tests E2E pour les pages critiques.

## Gestion des Données de Test

-   **Tests Unitaires & Intégration Backend :**
    -   Données mockées ou créées en mémoire pour chaque test.
    -   Pour les tests d'intégration avec base de données (H2 ou Testcontainers), le schéma sera créé/détruit pour chaque test ou classe de test (via Liquibase ou scripts SQL) pour assurer l'isolation.
-   **Tests E2E :**
    -   Un ensemble minimal de contenu MDX de test (articles, en FR et EN) sera nécessaire dans l'environnement de test.
    -   La base de données (pour les compteurs) sera dans un état connu au début des tests, potentiellement réinitialisée avant chaque suite de tests E2E.

## Intégration CI/CD (GitHub Actions)

-   **Déclenchement :**
    -   Tests unitaires et d'intégration (frontend & backend) : sur chaque `push` vers une branche et sur les `pull_request`.
    -   Tests E2E, performance, accessibilité, sécurité : sur les `pull_request` ciblant `develop` ou `main`, et après déploiement sur un environnement de staging (post-MVP) ou en nightly build.
-   **Rapports :** Les résultats des tests seront visibles dans GitHub Actions. Les échecs de tests critiques (TU, TI, E2E principaux) doivent bloquer le pipeline.
-   **Couverture de Code :**
    -   Génération de rapports de couverture (ex: Vitest coverage, JaCoCo pour Java).
    -   Viseur un objectif de couverture raisonnable pour les modules critiques (ex: >80%), mais la qualité des tests prime sur la quantité.

## Change Log

| Change        | Date       | Version | Description                                       | Author                            |
| ------------- | ---------- | ------- | ------------------------------------------------- | --------------------------------- |
| Initial draft | 2025-05-11 | 0.1     | Création initiale de la stratégie de tests.       | 3 - Architecte (IA)               |