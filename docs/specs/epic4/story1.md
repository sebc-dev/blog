# Story 4.1: Créer endpoint API pour incrémenter compteur de partage

**Status:** Draft

## Goal & Context

**User Story:** En tant que Développeur Backend (DevBE), je veux créer un endpoint API (`POST /api/v1/metrics/article/{articleCanonicalSlug}/{lang}/share`) qui incrémente un compteur de partage, afin de permettre au frontend de notifier le backend lorsqu'un article est partagé, pour un comptage anonyme.

**Context:** Cette story est la première étape backend pour la fonctionnalité de suivi des partages d'articles. Elle établit l'interface par laquelle le frontend signalera une action de partage. Elle dépendra de la story E4-B03 pour la persistance des données.

## Detailed Requirements

Créer un endpoint API `POST /api/v1/metrics/article/{articleCanonicalSlug}/{lang}/share` qui incrémente un compteur de partage pour un article et une langue donnés.

## Acceptance Criteria (ACs)

- AC1: L'endpoint Spring Boot `POST /api/v1/metrics/article/{articleCanonicalSlug}/{lang}/share` est créé et accessible publiquement pour le MVP.
- AC2: L'endpoint prend `articleCanonicalSlug` (String) et `lang` (String) comme paramètres de chemin.
- AC3: L'endpoint incrémente de 1 le champ `shareCount` dans l'entité `ArticleVersionMetric` correspondante au `articleCanonicalSlug` et `lang`.
- AC4: Si aucune entrée `ArticleVersionMetric` n'existe pour la combinaison `articleCanonicalSlug`/`lang`, une nouvelle entrée est créée avec `shareCount` initialisé à 1.
- AC5: L'endpoint retourne une réponse JSON contenant le nouveau `shareCount` total pour l'article et la langue spécifiés (ex: `{"shareCount": 124}`).
- AC6: La gestion des erreurs est standardisée conformément à `docs/architecture/api-reference.md` (ex: `400 Bad Request` pour paramètres invalides, `500 Internal Server Error` pour d'autres erreurs serveur).

## Technical Implementation Context

**Guidance:** Utiliser les détails suivants pour l'implémentation. Consulter les fichiers `docs/` liés pour un contexte plus large si nécessaire.

- **Relevant Files:**
  - Files to Create:
    - `backend/src/main/java/fr/kalifazzia/blogtechnique/metrics/controller/ArticleMetricsController.java` (ou ajouter méthode si existant)
    - `backend/src/main/java/fr/kalifazzia/blogtechnique/metrics/service/ArticleMetricsService.java` (ou ajouter méthode si existant)
  - Files to Modify:
    - Potentiellement `ArticleVersionMetricRepository.java` si des méthodes custom sont nécessaires (peu probable pour cette story).
  - _(Hint: Voir `docs/project-structure.md` pour la structure globale)_

- **Key Technologies:**
  - Java 21, Spring Boot, Spring Web, Spring Data JPA.
  - _(Hint: Voir `docs/architecture/tech-stack.md` pour la liste complète)_

- **API Interactions / SDK Usage:**
  - Interaction avec l'entité JPA `ArticleVersionMetric`.
  - Spécifications de l'endpoint et des réponses JSON dans `docs/architecture/api-reference.md`.

- **UI/UX Notes:** Non applicable pour cette story backend.

- **Data Structures:**
  - Entité `ArticleVersionMetric` comme définie dans `docs/architecture/data-models.md`.
  - Réponse JSON: `{"shareCount": <Integer>}` comme spécifié dans `docs/architecture/api-reference.md`.

- **Environment Variables:**
  - Pas de variables d'environnement spécifiques à cette story au-delà de la configuration de la base de données.
  - _(Hint: Voir `docs/setup/environnement-vars.md` pour toutes les variables)_

- **Coding Standards Notes:**
  - Suivre les conventions de nommage Java et Spring Boot.
  - Utiliser la Dependency Injection.
  - Implémenter la gestion des exceptions pour les erreurs potentielles (ex: article non trouvé, problème de base de données).
  - _(Hint: Voir `docs/contribution/normes-codage.md` pour les standards complets)_

## Tasks / Subtasks

- [ ] Définir la méthode `POST` pour `/api/v1/metrics/article/{articleCanonicalSlug}/{lang}/share` dans `ArticleMetricsController`.
- [ ] Implémenter la logique dans `ArticleMetricsService` pour :
  - [ ] Rechercher l'entité `ArticleVersionMetric` par `articleCanonicalSlug` et `lang`.
  - [ ] Si l'entité n'existe pas, la créer avec `shareCount = 1`.
  - [ ] Si l'entité existe, incrémenter `shareCount`.
  - [ ] Sauvegarder l'entité via `ArticleVersionMetricRepository`.
  - [ ] Retourner le nouveau `shareCount`.
- [ ] Assurer la gestion des paramètres de chemin (`@PathVariable`).
- [ ] Mettre en place la structure de réponse JSON attendue.
- [ ] Implémenter la gestion des erreurs (ex: `400 Bad Request` si paramètres de chemin mal formés, bien que Spring gère une partie).

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.

- **Unit Tests:**
  - Tester la logique de `ArticleMetricsService` en mockant `ArticleVersionMetricRepository`.
    - Scénario : création d'une nouvelle métrique de partage.
    - Scénario : incrémentation d'une métrique de partage existante.
- **Integration Tests:**
  - Tester l'endpoint `ArticleMetricsController` avec `@SpringBootTest` et `MockMvc`.
    - Envoyer une requête POST valide et vérifier la réponse JSON (`shareCount`) et l'état de la base de données (via Testcontainers ou H2).
    - Tester avec des paramètres de chemin invalides (si non entièrement couvert par les tests unitaires de Spring pour les conversions de type).
- _(Hint: Voir `docs/tests/strategie-tests.md` pour l'approche globale)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:**
- **Change Log:**
  - Initial Draft