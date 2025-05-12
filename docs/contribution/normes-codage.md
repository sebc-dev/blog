# Blog Technique Bilingue - Normes de Codage et Patterns

Ce document définit les normes de codage, les patterns de conception architecturale et les bonnes pratiques à suivre pour le développement du projet "Blog Technique Bilingue". L'objectif est d'assurer la cohérence, la maintenabilité, la lisibilité et la qualité du code produit par tous les contributeurs, y compris les agents IA.

## Architectural / Design Patterns Adopted

Les patterns architecturaux et de conception suivants sont adoptés pour ce projet afin de garantir la robustesse, la maintenabilité et l'évolutivité du système.

-   **Pattern 1 : Architecture Découplée Statique/API**
    -   **Rationale/Référence :** Ce pattern sépare la présentation (site statique Astro) des services backend (API Spring Boot). Il favorise la performance, la sécurité, la scalabilité et la maintenabilité.
    -   _Référence : `docs/architecture/architecture-principale.md` (Choix 1)_
-   **Pattern 2 : Site Statique avec Générateur (Astro)**
    -   **Rationale/Référence :** Utilisation d'Astro pour générer un site statique optimisé (zéro JS par défaut), améliorant les temps de chargement et le SEO. Astro facilite également la gestion de contenu via MDX et le support bilingue.
    -   _Référence : `docs/architecture/architecture-principale.md` (Choix 2)_
-   **Pattern 3 : API RESTful (Spring Boot)**
    -   **Rationale/Référence :** Le backend expose des services via une API RESTful claire et standardisée pour les fonctionnalités dynamiques (compteurs). Spring Boot est utilisé pour sa robustesse et son écosystème.
    -   _Référence : `docs/architecture/architecture-principale.md` (Choix 3 et section API Design)_
-   **Pattern 4 : Repository Pattern (Backend Spring Boot)**
    -   **Rationale/Référence :** Utilisé pour abstraire la logique de persistance des données. Spring Data JPA fournit une implémentation de ce pattern, améliorant la modularité et la testabilité de l'accès aux données.
    -   _Référence : `docs/architecture/architecture-principale.md` (Choix 10), `docs/architecture/data-models.md`_
-   **Pattern 5 : Dependency Injection (Backend Spring Boot)**
    -   **Rationale/Référence :** Fondamental dans Spring Boot, ce pattern favorise un couplage lâche entre les composants, améliorant la testabilité et la maintenabilité du code backend.
    -   _Référence : `docs/architecture/architecture-principale.md` (Choix 10)_
-   **Pattern 6 : Conteneurisation (Docker)**
    -   **Rationale/Référence :** Chaque composant principal (frontend, backend, base de données, reverse proxy) est conteneurisé avec Docker pour l'isolation, la reproductibilité et la simplification des déploiements.
    -   _Référence : `docs/architecture/architecture-principale.md` (Choix 5)_
-   **Pattern 7 : Infrastructure as Code (Docker Compose)**
    -   **Rationale/Référence :** Docker Compose est utilisé pour définir et gérer l'application multi-conteneurs, facilitant la configuration des environnements de développement et de production.
    -   _Référence : `docs/architecture/architecture-principale.md` (Infrastructure et Déploiement)_
-   **Pattern 8 : CI/CD (GitHub Actions)**
    -   **Rationale/Référence :** Automatisation des processus de build, test et déploiement via GitHub Actions pour assurer des livraisons fiables et fréquentes.
    -   _Référence : `docs/architecture/architecture-principale.md` (Choix 6 et Stratégie de Déploiement)_

## Coding Standards (Consider adding these to Dev Agent Context or Rules)

-   **Primary Language(s):**
    -   TypeScript 5.8 (pour le frontend Astro)
    -   Java 21 (LTS) (pour le backend Spring Boot)
-   **Primary Runtime(s):**
    -   Node.js 22 (LTS) (pour l'environnement de build et de développement Astro)
    -   JVM compatible avec Java 21 (pour l'exécution de l'application Spring Boot)
-   **Style Guide & Linter:**
    -   **TypeScript/Astro:**
        -   ESLint: Configuration à définir (ex: `eslint:recommended`, `plugin:typescript-eslint/recommended`, `plugin:astro/recommended`).
        -   Prettier: Utilisé pour le formatage automatique du code. Configuration à intégrer avec ESLint.
        -   _Configuration:_ Les fichiers de configuration (`.eslintrc.js`, `.prettierrc.js`, `.prettierignore`) seront à la racine du projet ou du sous-module frontend.
    -   **Java/Spring Boot:**
        -   Checkstyle: Configuration à définir (ex: basée sur Google Java Style Guide ou Sun Code Conventions).
        -   Spotless / PMD: Pourrait être utilisé pour le formatage et l'analyse statique supplémentaire.
        -   _Configuration:_ Les configurations seront intégrées dans le build Maven et les fichiers de configuration versionnés.
-   **Naming Conventions:**
    -   **TypeScript/JavaScript (Frontend):**
        -   Variables: `camelCase`
        -   Fonctions: `camelCase`
        -   Classes/Types/Interfaces/Composants Astro: `PascalCase`
        -   Constantes: `UPPER_SNAKE_CASE`
        -   Fichiers: `kebab-case.ts` (ou `.astro`, `.tsx`)
        -   Fichiers de composants Astro : `PascalCase.astro`
    -   **Java (Backend):**
        -   Variables: `camelCase`
        -   Méthodes: `camelCase`
        -   Classes/Interfaces/Enums: `PascalCase`
        -   Constantes: `UPPER_SNAKE_CASE`
        -   Packages: `lowercase.dot.separated` (ex: `com.example.blogtechnique.metrics.service`)
        -   Fichiers: `PascalCase.java`
-   **File Structure:**
    -   Adhérer à la structure définie dans `docs/project-structure.md`.
    -   Pour le backend Spring Boot, suivre les conventions de structuration par fonctionnalité ou par couche (à détailler dans `docs/project-structure.md`).
-   **Asynchronous Operations:**
    -   **TypeScript/Astro:** Utiliser `async/await` pour toutes les opérations asynchrones.
    -   **Java/Spring Boot:** Utiliser `CompletableFuture` pour les opérations asynchrones non bloquantes si nécessaire. Les appels bloquants (ex: I/O base de données) sont gérés par Spring dans des threads appropriés.
-   **Type Safety:**
    -   **TypeScript/Astro:** Utiliser le mode `strict` de TypeScript. Définir des interfaces claires pour les props des composants, les payloads API, et les modèles de données partagés. Les définitions de types partagés pourraient résider dans `src/common/types.ts` ou une structure similaire.
    -   **Java/Spring Boot:** Utiliser pleinement le système de typage statique de Java. Définir des DTOs (Data Transfer Objects) clairs pour les payloads API et les réponses.
-   **Comments & Documentation:**
    -   **Général:**
        -   Le code doit être aussi auto-documenté que possible grâce à des noms clairs et une structure logique.
        -   Les commentaires doivent expliquer le "pourquoi" et non le "comment", sauf pour des algorithmes complexes.
        -   Anglais privilégié pour les commentaires dans le code et les messages de commit pour une audience technique plus large, même si le projet cible aussi les francophones.
    -   **TypeScript/Astro:**
        -   Utiliser JSDoc pour documenter les fonctions, composants, et types exportés.
    -   **Java/Spring Boot:**
        -   Utiliser JavaDoc pour documenter les classes publiques, les méthodes publiques/protégées, et les APIs.
    -   **READMEs:** Chaque module principal ou service complexe devrait avoir un README expliquant son rôle, sa configuration et son utilisation.
-   **Dependency Management:**
    -   **TypeScript/Astro:** **PNPM**. Le fichier `pnpm-lock.yaml` et `package.json` doivent être versionnés.
    -   **Java/Spring Boot:** **Maven**. Le `pom.xml` doit être versionné. Spring Boot Bill of Materials (BOM) doit être utilisé pour gérer les versions des dépendances de l'écosystème Spring.
    -   **Politique d'ajout de dépendances:**
        -   Évaluer la nécessité et la maintenabilité de toute nouvelle dépendance.
        -   Privilégier les bibliothèques bien maintenues et populaires.
        -   Vérifier les licences des dépendances.
        -   Analyser les vulnérabilités des dépendances (ex: `pnpm audit`, `Trivy`).
-   **Utilisateurs non-root dans les Dockerfiles:**
    -   Pour des raisons de sécurité, les conteneurs Docker doivent être configurés pour s'exécuter avec un utilisateur non-root. Cela sera spécifié dans chaque `Dockerfile`.
-   **Modèle de branches Git et conventions de commit:**
    -   **Modèle de branches:**
        -   `main`: Branche principale reflétant l'état de production. Protégée.
        -   `develop`: Branche d'intégration pour les fonctionnalités à venir.
        -   `feature/<nom-feature>`: Branches pour le développement de nouvelles fonctionnalités, partant de `develop`. Utiliser des noms sémantiques en anglais (ex: `feature/user-authentication`).
        -   `fix/<nom-fix>`: Branches pour les corrections de bugs.
        -   `chore/<description>`: Branches pour les tâches de maintenance, refactoring, etc.
    -   **Conventions de commit:**
        -   Utiliser Gitmoji (https://gitmoji.dev/) pour préfixer les messages de commit avec un emoji pertinent, suivi d'un message de commit impératif et concis en anglais.
        -   Exemple : `:sparkles: Add new share counter feature`
        -   Exemple : `:bug: Fix off-by-one error in pagination`
        -   Exemple : `:memo: Update API documentation for metrics endpoint`

## Error Handling Strategy

Une stratégie de gestion des erreurs robuste est essentielle pour la stabilité et la maintenabilité de l'application.

-   **General Approach:**
    -   **Backend (Spring Boot):**
        -   Utiliser le mécanisme d'exceptions de Java.
        -   Mettre en place des `@ControllerAdvice` globaux pour intercepter les exceptions spécifiques (ex: `ResourceNotFoundException`, `ValidationException`) et les exceptions génériques (`RuntimeException`, `Exception`) afin de les transformer en réponses HTTP standardisées (voir `docs/architecture/api-reference.md` et la section "API Design" dans `architecture-principale.txt` pour le format JSON des erreurs).
        -   Les exceptions non gérées explicitement résulteront en une réponse `500 Internal Server Error` avec un message d'erreur générique pour ne pas exposer de détails d'implémentation sensibles.
    -   **Frontend (Astro/TypeScript):**
        -   Utiliser des blocs `try/catch` pour les appels API asynchrones vers le backend.
        -   Gérer les erreurs de manière à ne pas interrompre l'expérience utilisateur principale (lecture des articles).
        -   Afficher des messages d'erreur discrets et informatifs si une action utilisateur échoue (ex: échec de la soumission d'un feedback).

-   **Logging:**
    -   **Library/Method:**
        -   **Backend (Spring Boot):** SLF4J avec Logback (configuration par défaut de Spring Boot).
        -   **Frontend (Astro/TypeScript):** `console.error()` pour les erreurs capturées importantes. Des logs plus structurés pourraient être envoyés à un service de logging externe post-MVP si nécessaire.
        -   **Nginx (dans conteneur Astro):** Logs d'accès et d'erreur standard de Nginx, à rediriger vers `stdout/stderr` du conteneur Docker pour être collectés.
        -   **Traefik:** Logs d'accès et d'application, configurés pour être utiles au débogage.
        -   **PostgreSQL:** Logs standards du serveur de base de données.
    -   **Format:**
        -   **Backend:** JSON structuré. Chaque log devrait inclure timestamp, niveau, thread, logger name, message, et potentiellement un ID de corrélation pour tracer les requêtes.
        -   **Autres:** Format texte standard, mais acheminé via `stdout/stderr` pour être géré par le système de logging de Docker/VPS.
    -   **Levels:** Utiliser les niveaux de log standards (DEBUG, INFO, WARN, ERROR).
        -   `DEBUG`: Informations détaillées pour le développement. Ne pas activer en production sauf pour investigation ponctuelle.
        -   `INFO`: Événements importants du déroulement normal de l'application (ex: démarrage du service, requête API traitée avec succès pour les compteurs).
        -   `WARN`: Situations potentiellement problématiques qui n'empêchent pas le fonctionnement actuel mais pourraient le faire à terme (ex: tentative de re-soumission rapide d'un vote).
        -   `ERROR`: Erreurs avérées qui ont empêché une opération de se terminer correctement. Les exceptions capturées seront généralement loguées à ce niveau avec leur stack trace.
    -   **Context:**
        -   **Backend:** Inclure des informations contextuelles comme l'ID de l'article concerné, l'adresse IP de l'utilisateur (anonymisée si nécessaire et uniquement pour des raisons de sécurité/diagnostic), et un ID de requête unique pour le traçage distribué (même si pour le MVP, le système est simple).
        -   **Frontend:** Le contexte de l'erreur (ex: quel composant, quelle action utilisateur).

-   **Specific Handling Patterns:**
    -   **External API Calls (Frontend vers Backend API):**
        -   Utiliser `try/catch` autour des `Workspace` ou des appels de librairie HTTP.
        -   Vérifier le statut de la réponse HTTP (ex: `response.ok`).
        -   Pour les fonctionnalités de comptage (partage, utilité) :
            -   En cas d'échec de l'appel API (erreur réseau, erreur serveur 5xx), l'interface utilisateur ne doit pas bloquer. L'action principale (navigation, lecture) reste possible.
            -   Un message discret pourrait indiquer que l'action n'a pas pu être enregistrée, ou simplement échouer silencieusement pour ne pas dégrader l'UX pour une fonctionnalité non critique.
            -   Pas de retry automatique agressif pour ces compteurs pour le MVP afin d'éviter de surcharger le backend. Un retry manuel par l'utilisateur (s'il réessaie l'action) est acceptable.
    -   **Input Validation:**
        -   **Backend (Spring Boot):** Utiliser les annotations de validation de Bean Validation (`jakarta.validation.constraints.*`) sur les DTOs. Les erreurs de validation résulteront en une réponse `400 Bad Request` avec des détails sur les champs invalides (voir format d'erreur standardisé).
        -   **Frontend (Astro/TypeScript):** Validation de base côté client (ex: format de l'email pour une future newsletter) pour améliorer l'UX, mais la validation faisant autorité est toujours celle du backend.
    -   **Graceful Degradation vs. Critical Failure:**
        -   **Critique:** Le service des articles (frontend Astro) doit toujours être disponible.
        -   **Dégradation Gracieuse:** Si l'API de comptage (backend Spring Boot) est indisponible, les fonctionnalités de comptage (partage, "article utile") échoueront mais le reste du site (lecture des articles, navigation) doit continuer à fonctionner normalement. Le frontend doit gérer ces échecs sans impacter l'expérience principale.

-   **Observability:**
    -   Référez-vous à `docs/observabilite/strategie-observabilite.md` pour la stratégie complète de logging, monitoring et alerting. (Ce document sera créé ultérieurement comme indiqué dans la `TODO.txt`).

## Security Best Practices

La sécurité est une préoccupation majeure à toutes les étapes du cycle de vie du projet. Les pratiques suivantes doivent être observées.

-   **Input Sanitization/Validation:**
    -   **Backend (Spring Boot):**
        -   Valider systématiquement toutes les données entrantes provenant de sources non fiables (ex: payloads des requêtes API) en utilisant Bean Validation (`jakarta.validation.constraints.*`) sur les DTOs.
        -   Encoder les données sortantes de manière appropriée pour prévenir les attaques XSS si ces données devaient être interprétées par un navigateur (bien que pour le MVP, l'API retourne principalement des données de comptage et des confirmations).
    -   **Frontend (Astro/TypeScript):**
        -   Bien qu'Astro gère par défaut l'échappement des variables dans les templates pour prévenir XSS, être vigilant lors de l'utilisation de directives comme `set:html`.
        -   Toute donnée affichée provenant d'une API (même la nôtre) doit être traitée comme potentiellement dangereuse si elle n'est pas correctement encodée ou si elle est utilisée dans des contextes risqués.

-   **Secrets Management:**
    -   **Référencer `docs/setup/environnement-vars.md` pour la liste complète des variables d'environnement et leur sensibilité.**
    -   **En Production (VPS):**
        -   Les secrets (clés API, mots de passe de base de données, etc.) ne doivent JAMAIS être codés en dur dans le code source ou les Dockerfiles.
        -   Ils seront injectés en tant que variables d'environnement dans les conteneurs Docker via Docker Compose.
        -   Les fichiers `.env` sur le serveur VPS contenant ces secrets doivent avoir des permissions restrictives (ex: `chmod 600`).
        -   L'accès SSH au VPS doit être sécurisé (clés SSH, mots de passe robustes, `fail2ban`).
    -   **En Développement Local:**
        -   Utiliser des fichiers `.env` locaux (non versionnés, listés dans `.gitignore`) pour stocker les secrets de développement.
        -   Fournir un fichier `.env.example` versionné avec des placeholders.
    -   **CI/CD (GitHub Actions):**
        -   Utiliser les "Encrypted Secrets" de GitHub Actions pour stocker les secrets nécessaires au pipeline (ex: identifiants GHCR, clés SSH pour le déploiement).

-   **Dependency Security:**
    -   **Analyse régulière des vulnérabilités:**
        -   Utiliser `pnpm audit` (frontend) et des outils d'analyse Maven (ex: OWASP Dependency-Check, Snyk via GitHub Actions) pour le backend afin d'identifier les dépendances avec des vulnérabilités connues.
        -   Intégrer l'analyse de vulnérabilités des images Docker avec Trivy dans le pipeline CI/CD (comme spécifié dans `architecture-principale.txt` et `prd-blog-bilingue.txt`).
    -   **Maintien à jour des dépendances:** Mettre en place une stratégie pour mettre à jour régulièrement les dépendances vers des versions sécurisées, après tests.

-   **Authentication/Authorization Checks:**
    -   **API Backend (Spring Boot):**
        -   Pour le MVP, les endpoints de métriques sont publics.
        -   Post-MVP, si des fonctionnalités d'administration ou des endpoints protégés sont ajoutés, implémenter une authentification robuste (ex: Spring Security avec JWT ou OAuth2) et des vérifications d'autorisation granulaires.
    -   **Dashboard Traefik:** Si le dashboard Traefik est activé en production, il doit être sécurisé par une authentification (ex: Basic Auth), comme mentionné dans `architecture-principale.txt`.

-   **Protection contre les vulnérabilités web courantes (OWASP Top 10):**
    -   **HTTPS Partout:** Traefik gère la terminaison SSL/TLS et redirige HTTP vers HTTPS.
    -   **Headers de Sécurité:** Configurer Traefik (ou l'application elle-même si nécessaire) pour ajouter des headers de sécurité HTTP importants (ex: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`).
    -   **CSRF Protection:** Non applicable directement pour les API de comptage du MVP qui sont idempotentes ou sans état de session utilisateur. Si des formulaires ou des actions modifiant l'état sont ajoutés post-MVP avec une gestion de session, une protection CSRF sera nécessaire.
    -   **Rate Limiting:** Envisager une limitation de débit sur les endpoints API (via Traefik ou Spring Boot) post-MVP pour prévenir les abus et les attaques par déni de service de base.

-   **Principe de moindre privilège:**
    -   **Conteneurs Docker:** Configurer les conteneurs pour qu'ils s'exécutent avec des utilisateurs non-root (spécifié dans les `Dockerfile`).
    -   **Accès Base de Données:** L'utilisateur de la base de données configuré pour l'application Spring Boot doit avoir uniquement les permissions nécessaires sur le schéma et les tables qu'il gère.

-   **Sécurité de l'Infrastructure (VPS):**
    -   Maintenir le système d'exploitation Debian et les paquets (Docker, Traefik) à jour (`unattended-upgrades` recommandé).
    -   Configurer le pare-feu du VPS (`iptables-nft`) de manière restrictive (politiques `DROP`, exceptions explicites pour SSH, HTTP, HTTPS) et utiliser `iptables-persistent` pour la sauvegarde des règles.
    -   Sécuriser l'accès SSH (clé uniquement, `PasswordAuthentication no`, `PermitRootLogin no`, `fail2ban` actif sur `sshd`). L'option 2FA TOTP peut être envisagée.
    -   Voir `docs/specs/epic1/story1.md` et `docs/operations/runbook.md` pour les détails de configuration.

-   **Logging et Monitoring de Sécurité:**
    -   Les logs d'accès et d'erreur (Traefik, Nginx, Spring Boot, PostgreSQL, `auth.log`, `fail2ban.log`) doivent être collectés et potentiellement monitorés pour détecter des activités suspectes (voir `docs/observabilite/strategie-observabilite.md`).

## Change Log

| Change        | Date       | Version | Description                                                                                                    | Author                            |
| ------------- | ---------- | ------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Initial draft | 2025-05-11 | 0.1     | Initial draft des normes de codage et patterns.                                                                 | 3 - Architecte (IA) & Utilisateur |
| Update        | 2025-05-12 | 0.2     | Mise à jour de la section Sécurité Infrastructure VPS pour refléter `story1.md` (iptables-nft, SSH, fail2ban). | Gemini & Utilisateur              |