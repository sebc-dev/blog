# Story 4.02: Créer endpoint API pour enregistrer feedback d'utilité

**Status:** Draft

## Goal & Context

**User Story:** En tant que DevBE, je veux créer un endpoint API (`POST /api/v1/metrics/article/{articleCanonicalSlug}/{lang}/feedback`) qui enregistre un vote d'utilité, afin de permettre au frontend de soumettre un feedback ("yes" ou "no") sur l'utilité d'un article, pour un comptage anonyme.

**Context:** Cette story met en place le mécanisme backend pour recueillir le feedback des utilisateurs sur l'utilité des articles. Elle est complémentaire à E4-B01 et dépend aussi de E4-B03 pour la persistance.

## Detailed Requirements

Créer un endpoint API `POST /api/v1/metrics/article/{articleCanonicalSlug}/{lang}/feedback` qui enregistre un vote d'utilité ("yes" ou "no") pour un article et une langue donnés.

## Acceptance Criteria (ACs)

- AC1: L'endpoint Spring Boot `POST /api/v1/metrics/article/{articleCanonicalSlug}/{lang}/feedback` est créé et accessible publiquement pour le MVP.
- AC2: L'endpoint prend `articleCanonicalSlug` (String) et `lang` (String) comme paramètres de chemin.
- AC3: L'endpoint accepte un payload JSON de la forme `{"vote": "yes"}` ou `{"vote": "no"}`. Ce payload est mappé vers le DTO `ArticleFeedbackPayload`.
- AC4: La valeur de `vote` dans le payload est validée et doit être soit "yes", soit "no" (insensible à la casse pour la réception, mais stockée ou comparée de manière normalisée).
- AC5: En fonction de la valeur de `vote`, l'endpoint incrémente le champ `usefulYesCount` ou `usefulNoCount` dans l'entité `ArticleVersionMetric` correspondante.
- AC6: Si aucune entrée `ArticleVersionMetric` n'existe pour la combinaison `articleCanonicalSlug`/`lang`, une nouvelle entrée est créée avec le compteur approprié (`usefulYesCount` ou `usefulNoCount`) initialisé à 1 et l'autre à 0.
- AC7: L'endpoint retourne une réponse JSON contenant les nouveaux `usefulYesCount` et `usefulNoCount` totaux pour l'article et la langue spécifiés (ex: `{"usefulYesCount": 88, "usefulNoCount": 12}`).
- AC8: La gestion des erreurs est standardisée, incluant `400 Bad Request` si le payload est invalide (ex: `vote` manquant ou valeur incorrecte). Les détails de la validation sont dans le champ `validationErrors` de la réponse d'erreur standardisée.

## Technical Implementation Context

**Guidance:** Utiliser les détails suivants pour l'implémentation. Consulter les fichiers `docs/` liés pour un contexte plus large si nécessaire.

- **Relevant Files:**
  - Files to Create:
    - `backend/src/main/java/fr/kalifazzia/blogtechnique/metrics/dto/ArticleFeedbackPayload.java`
    - `backend/src/main/java/fr/kalifazzia/blogtechnique/metrics/dto/FeedbackVote.java` (Enum)
  - Files to Modify:
    - `backend/src/main/java/fr/kalifazzia/blogtechnique/metrics/controller/ArticleMetricsController.java` (ajouter méthode)
    - `backend/src/main/java/fr/kalifazzia/blogtechnique/metrics/service/ArticleMetricsService.java` (ajouter méthode)
  - _(Hint: Voir `docs/project-structure.md` pour la structure globale)_

- **Key Technologies:**
  - Java 21, Spring Boot, Spring Web, Spring Data JPA, Jakarta Bean Validation.
  - _(Hint: Voir `docs/architecture/tech-stack.md` pour la liste complète)_

- **API Interactions / SDK Usage:**
  - Interaction avec l'entité JPA `ArticleVersionMetric`.
  - Spécifications de l'endpoint, du payload et des réponses JSON dans `docs/architecture/api-reference.md`.

- **UI/UX Notes:** Non applicable pour cette story backend.

- **Data Structures:**
  - Entité `ArticleVersionMetric` comme définie dans `docs/architecture/data-models.md`.
  - DTO `ArticleFeedbackPayload` et Enum `FeedbackVote` comme définis dans `docs/architecture/data-models.md` (ou à créer sur cette base).
  - Réponse JSON: `{"usefulYesCount": <Integer>, "usefulNoCount": <Integer>}` comme spécifié dans `docs/architecture/api-reference.md`.

- **Environment Variables:**
  - Pas de variables d'environnement spécifiques à cette story au-delà de la configuration de la base de données.
  - _(Hint: Voir `docs/setup/environnement-vars.md` pour toutes les variables)_

- **Coding Standards Notes:**
  - Utiliser les annotations `@Valid` et de validation (ex: `@NotNull`) sur le DTO `ArticleFeedbackPayload` dans le contrôleur.
  - Gérer la logique de comptage dans la couche service.
  - _(Hint: Voir `docs/contribution/normes-codage.md` pour les standards complets)_

## Tasks / Subtasks

- [ ] Créer l'Enum `FeedbackVote.java` avec les valeurs `YES` et `NO` (et la logique de (dé)sérialisation JSON via `@JsonValue` / `@JsonCreator` si besoin).
- [ ] Créer le DTO `ArticleFeedbackPayload.java` avec un champ `vote` de type `FeedbackVote` et des annotations de validation.
- [ ] Définir la méthode `POST` pour `/api/v1/metrics/article/{articleCanonicalSlug}/{lang}/feedback` dans `ArticleMetricsController`, acceptant `@Valid ArticleFeedbackPayload`.
- [ ] Implémenter la logique dans `ArticleMetricsService` pour :
  - [ ] Rechercher l'entité `ArticleVersionMetric`.
  - [ ] Si elle n'existe pas, la créer et initialiser les compteurs `usefulYesCount`/`usefulNoCount` en fonction du vote.
  - [ ] Si elle existe, incrémenter le compteur `usefulYesCount` ou `usefulNoCount` approprié.
  - [ ] Sauvegarder l'entité.
  - [ ] Retourner les nouveaux `usefulYesCount` et `usefulNoCount`.
- [ ] Mettre en place la structure de réponse JSON attendue.
- [ ] Configurer la gestion des erreurs de validation pour retourner le format d'erreur standardisé.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.

- **Unit Tests:**
  - Tester la logique de `ArticleMetricsService` en mockant `ArticleVersionMetricRepository`.
    - Scénario : vote "yes" sur un nouvel article.
    - Scénario : vote "no" sur un nouvel article.
    - Scénario : vote "yes" sur un article existant.
    - Scénario : vote "no" sur un article existant.
  - Tester la validation du DTO `ArticleFeedbackPayload` (peut être testé séparément ou via des tests de contrôleur).
- **Integration Tests:**
  - Tester l'endpoint `ArticleMetricsController` avec `@SpringBootTest` et `MockMvc`.
    - Envoyer une requête POST valide avec `{"vote": "yes"}` et vérifier la réponse et la BDD.
    - Envoyer une requête POST valide avec `{"vote": "no"}` et vérifier la réponse et la BDD.
    - Envoyer une requête POST avec un payload invalide (ex: `vote` manquant, valeur incorrecte) et vérifier la réponse d'erreur `400 Bad Request` et son format.
- _(Hint: Voir `docs/tests/strategie-tests.md` pour l'approche globale)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:**
- **Change Log:**
  - Initial Draft