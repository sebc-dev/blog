# Story 1.10: Initialisation Projet Backend Spring Boot de Base

**Status:** Draft

## Goal & Context

**User Story:** En tant que Développeur (Dev), je veux initialiser un nouveau projet Spring Boot dans `backend/` avec Maven et les dépendances de base (Web, JPA, PostgreSQL, Lombok, Actuator, Liquibase) afin d'avoir un projet backend Spring Boot fonctionnel avec les technologies requises.

**Context:** Parallèlement à la création du frontend (Story 1.6), cette story établit le squelette de l'application backend qui gérera les fonctionnalités dynamiques du MVP, comme les compteurs. Elle s'appuie sur la structure de monorepo (Story 1.5) et l'infrastructure serveur (Stories 1.1-1.4).

## Detailed Requirements

Initialiser un projet Spring Boot (version spécifiée dans `docs/teck-stack.md`) dans le répertoire `backend/` en utilisant Maven. Ajouter les dépendances essentielles : Spring Web, Spring Data JPA, le driver PostgreSQL, Lombok, Spring Boot Actuator, et Liquibase Core. Configurer la structure de package de base.

## Acceptance Criteria (ACs)

- AC1: Un projet Spring Boot (version spécifiée, ex: 3.4.5) est créé et fonctionnel dans le répertoire `backend/` en utilisant Maven comme outil de build.
- AC2: Le `pom.xml` inclut les dépendances `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `postgresql` (driver), `lombok`, `spring-boot-starter-actuator`, et `liquibase-core`.
- AC3: La structure de package de base (ex: `fr.kalifazzia.blogtechnique`) est créée.
- AC4: L'application Spring Boot principale (classe avec `@SpringBootApplication`) est créée et l'application peut démarrer avec succès (localement, sans nécessiter encore de connexion DB pleinement configurée pour ce test initial de démarrage).
- AC5: Lombok est configuré et fonctionnel (vérifiable par l'absence d'erreurs de compilation si des annotations Lombok sont utilisées sur une classe simple).

## Technical Implementation Context

**Guidance:** Utiliser Spring Initializr (via le web ou l'IDE) pour générer la structure de base du projet Maven avec les dépendances spécifiées.

- **Relevant Files:**
  - Files to Create/Modify in `backend/`:
    - `pom.xml`
    - `src/main/java/fr/kalifazzia/blogtechnique/BlogTechniqueApplication.java` (ou nom similaire)
    - `src/main/resources/application.properties` (ou `application.yml`)
    - Structure de dossiers des packages.
  - _(Hint: Voir `docs/project-structure.md` pour la structure cible du répertoire `backend/` et `docs/teck-stack.md` pour les versions)_

- **Key Technologies:**
  - Spring Boot (version 3.4.5 ou compatible)
  - Java (version 21 LTS)
  - Maven
  - Spring Web, Spring Data JPA, PostgreSQL Driver, Lombok, Spring Boot Actuator, Liquibase Core.
  - _(Hint: Voir `docs/teck-stack.md`)_

- **API Interactions / SDK Usage:**
  - Non applicable pour cette story.

- **UI/UX Notes:**
  - Non applicable pour cette story.

- **Data Structures:**
  - Non applicable pour cette story.

- **Environment Variables:**
  - La configuration de la base de données via variables d'environnement sera traitée dans la Story 1.11 (E1-B02).
  - _(Hint: Voir `docs/environnement-vars.md`)_

- **Coding Standards Notes:**
  - Suivre les conventions de nommage Java et Spring Boot.
  - Le `pom.xml` doit être bien structuré.
  - _(Hint: Voir `docs/normes-codage.md`)_

## Tasks / Subtasks

- [ ] Générer un nouveau projet Spring Boot (ex: via `start.spring.io` ou l'assistant de l'IDE) dans le répertoire `backend/` avec les configurations suivantes :
    - Project: Maven
    - Language: Java
    - Spring Boot Version: 3.4.5 (ou la version spécifiée dans `teck-stack.md`)
    - Group: `fr.kalifazzia`
    - Artifact: `blogtechnique`
    - Name: `blogtechnique`
    - Description: Blog Technique Bilingue - Backend
    - Package name: `fr.kalifazzia.blogtechnique`
    - Packaging: Jar
    - Java Version: 21
    - Dependencies:
        - Spring Web
        - Spring Data JPA
        - PostgreSQL Driver
        - Lombok
        - Spring Boot Actuator
        - Liquibase Migration
- [ ] Vérifier le fichier `pom.xml` généré pour s'assurer que toutes les dépendances requises sont présentes.
- [ ] Créer la classe principale de l'application (ex: `BlogTechniqueApplication.java`) avec l'annotation `@SpringBootApplication` dans le package racine.
- [ ] Tenter de compiler et de démarrer l'application localement (`mvn spring-boot:run` ou via l'IDE). Elle devrait démarrer même si la configuration de la base de données n'est pas encore complète (elle pourrait échouer plus tard si elle tente activement de se connecter sans config valide, mais le démarrage initial du contexte Spring devrait être possible).
- [ ] (Optionnel) Créer une entité simple et utiliser une annotation Lombok (ex: `@Getter`) pour vérifier que Lombok est bien configuré dans le `pom.xml` et reconnu par l'IDE.
- [ ] Ajouter les fichiers générés/modifiés à Git.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.
- **Manual/CLI Verification:**
  - La commande `mvn clean install` (ou `mvnw clean install` si le wrapper est utilisé) doit s'exécuter avec succès dans le répertoire `backend/`.
  - L'application Spring Boot doit démarrer sans erreurs critiques liées à la configuration de base du projet (la connexion à la base de données sera testée dans la story suivante).
  - La structure des packages et le `pom.xml` doivent correspondre aux attentes.
- _(Hint: Voir `docs/strategie-tests.md` pour l'approche globale)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
- **Change Log:**
  - Initial Draft