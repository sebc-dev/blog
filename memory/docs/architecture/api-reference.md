# Blog Technique Bilingue - Référence API

## Introduction

Ce document fournit une référence détaillée pour les APIs utilisées et exposées par le projet "Blog Technique Bilingue". Pour le MVP, cela se concentre principalement sur l'API interne fournie par le backend Spring Boot pour la gestion des métriques d'articles.

*(Note : Pour une spécification plus formelle et évolutive, notamment si le nombre d'endpoints augmente significativement, cette section pourra être externalisée vers un document de référence OpenAPI (ex: `openapi.yaml`) et/ou générée automatiquement depuis le code backend à l'avenir.)*

## APIs Externes Consommées

Pour le MVP, l'application ne consomme pas directement d'API externes tierces nécessitant une documentation détaillée ici (au-delà de l'intégration de Google Analytics qui se fait via un script client et non des appels API serveur à serveur).
Si des services externes sont ajoutés (ex: service de newsletter), cette section sera complétée.

## APIs Internes Fournies

### Metrics API (Backend Spring Boot)

-   **Objectif :** Fournir des endpoints pour enregistrer de manière anonyme les interactions des utilisateurs avec les articles, telles que les partages et les votes d'utilité. Ces métriques sont stockées dans la base de données PostgreSQL.
    *(Source : `architecture-principale.txt`, section API Design)*
-   **URL de Base :** `/api/v1/metrics`
    *(Source : `architecture-principale.txt`, section API Design)*
-   **Authentification/Autorisation :** Aucune authentification requise pour ces endpoints dans le cadre du MVP. Ils sont publics. Des mesures de limitation de débit (rate limiting) pourraient être envisagées post-MVP via Traefik ou Spring Security pour prévenir les abus.
    *(Source : `architecture-principale.txt`, section API Design)*
-   **Format des Données :** JSON (`application/json`) pour les corps de requête et de réponse.
    *(Source : `architecture-principale.txt`, section API Design)*
-   **Gestion des Erreurs Standardisée :**
    Toutes les erreurs API (validation, serveur, etc.) retourneront une réponse JSON standardisée. Ce format inclut systématiquement les champs suivants :
    * `timestamp` (String, ISO 8601) : L'heure à laquelle l'erreur s'est produite.
    * `status` (Integer) : Le code de statut HTTP.
    * `error` (String) : La description textuelle du code de statut HTTP (ex: "Bad Request", "Internal Server Error").
    * `message` (String) : Un message descriptif de l'erreur, spécifique à l'application et potentiellement lisible par un utilisateur technique.
    * `path` (String) : Le chemin de l'API qui a été appelé.
    * `validationErrors` (Array d'objets, optionnel) : Présent pour les erreurs de validation (`400 Bad Request`), listant les champs invalides et les messages d'erreur associés. Chaque objet peut contenir `field` et `message`.

    **Exemple de Réponse d'Erreur (`400 Bad Request` avec erreurs de validation) :**
    ```json
    {
      "timestamp": "2025-05-11T10:30:00.123Z",
      "status": 400,
      "error": "Bad Request",
      "message": "Validation failed for a few fields.",
      "path": "/api/v1/metrics/article/mon-slug/fr/feedback",
      "validationErrors": [
        {
          "field": "vote",
          "message": "Le vote ne peut être nul et doit être 'yes' ou 'no'."
        }
      ]
    }
    ```
    *(Source : `architecture-principale.txt`, section API Design, et `TODO.txt` sur la standardisation des erreurs API. Format `validationErrors` ajouté pour plus de clarté.)*

### Endpoints de l'API Metrics

#### 1. Enregistrer un Partage d'Article

-   **Endpoint :** `POST /api/v1/metrics/article/{articleCanonicalSlug}/{lang}/share`
-   **Description :** Incrémente de 1 le compteur de partage pour la version linguistique (`lang`) spécifiée de l'article identifié par son `articleCanonicalSlug`. Si aucune entrée n'existe pour cette combinaison `articleCanonicalSlug`/`lang`, une nouvelle entrée est créée avec un compteur de partage à 1.
    *(Source : `architecture-principale.txt` et `prd-blog-bilingue.txt` - Epic 4)*
-   **Paramètres de Chemin :**
    * `articleCanonicalSlug` (String, Requis) : Le slug canonique unique de l'article, indépendant de la langue. Correspond au champ `translationId` du frontmatter MDX.
        * Exemple : `mon-super-article-tauri-2025`
        * Contraintes : Doit correspondre au format utilisé pour `translationId` (ex: `^[a-z0-9]+(?:-[a-z0-9]+)*$`, longueur max 120).
    * `lang` (String, Requis) : Le code de langue de la version de l'article partagée.
        * Exemple : `fr`, `en`
        * Contraintes : Doit être un code de langue supporté (ex: `fr` ou `en`, longueur max 20).
-   **Corps de la Requête :** Aucun (`Empty Body`).
-   **Réponse de Succès :**
    * **Code :** `200 OK`
    * **Corps :**
        ```json
        {
          "shareCount": 124
        }
        ```
        * `shareCount` (Integer) : Le nouveau total de partages pour cet `articleCanonicalSlug` et cette `lang` après l'incrémentation.
        *(Source : `data-models.txt` - Schémas de Réponse API)*
-   **Réponses d'Erreur Possibles :**
    * `400 Bad Request` : Si `articleCanonicalSlug` ou `lang` sont manquants, mal formés, ou ne respectent pas les contraintes (longueur, format). Voir le format d'erreur standardisé en début de section.
    * `500 Internal Server Error` : En cas d'erreur interne du serveur lors du traitement (ex: problème de connexion à la base de données non géré spécifiquement).

#### 2. Enregistrer un Feedback d'Utilité sur un Article

-   **Endpoint :** `POST /api/v1/metrics/article/{articleCanonicalSlug}/{lang}/feedback`
-   **Description :** Enregistre un vote d'utilité (positif "yes" ou négatif "no") pour la version linguistique (`lang`) spécifiée de l'article identifié par son `articleCanonicalSlug`. Si aucune entrée n'existe pour cette combinaison, une nouvelle entrée est créée avec le compteur correspondant (soit `usefulYesCount` soit `usefulNoCount`) initialisé à 1 et l'autre à 0. Si une entrée existe, le compteur approprié est incrémenté de 1.
    *(Source : `architecture-principale.txt` et `prd-blog-bilingue.txt` - Epic 4)*
-   **Paramètres de Chemin :**
    * `articleCanonicalSlug` (String, Requis) : Le slug canonique unique de l'article, indépendant de la langue. Correspond au champ `translationId` du frontmatter MDX.
        * Exemple : `mon-super-article-tauri-2025`
        * Contraintes : Doit correspondre au format utilisé pour `translationId` (ex: `^[a-z0-9]+(?:-[a-z0-9]+)*$`, longueur max 120).
    * `lang` (String, Requis) : Le code de langue de la version de l'article pour laquelle le feedback est donné.
        * Exemple : `fr`, `en`
        * Contraintes : Doit être un code de langue supporté (ex: `fr` ou `en`, longueur max 20).
-   **Corps de la Requête :** `application/json`
    * **Schéma :**
        ```json
        {
          "vote": "yes"
        }
        ```
        ou
        ```json
        {
          "vote": "no"
        }
        ```
    * **Champs :**
        * `vote` (String, Requis) : La valeur du feedback.
            * Valeurs autorisées : `"yes"`, `"no"`. La validation est assurée par le backend (Enum `FeedbackVote`).
            *(Source : `data-models.txt` - DTO `ArticleFeedbackPayload` et Enum `FeedbackVote`)*
-   **Réponse de Succès :**
    * **Code :** `200 OK`
    * **Corps :**
        ```json
        {
          "usefulYesCount": 88,
          "usefulNoCount": 12
        }
        ```
        * `usefulYesCount` (Integer) : Le nouveau total de votes "utiles : oui" pour cet `articleCanonicalSlug` et cette `lang` après l'opération.
        * `usefulNoCount` (Integer) : Le nouveau total de votes "utiles : non" pour cet `articleCanonicalSlug` et cette `lang` après l'opération.
        *(Source : `data-models.txt` - Schémas de Réponse API)*
-   **Réponses d'Erreur Possibles :**
    * `400 Bad Request` :
        * Si `articleCanonicalSlug` ou `lang` sont manquants ou mal formés.
        * Si le corps de la requête est manquant, mal formé, ou si le champ `vote` est manquant ou a une valeur non autorisée (ex: ni "yes", ni "no"). Les détails de la validation seront dans le champ `validationErrors` de la réponse d'erreur standardisée.
    * `500 Internal Server Error` : En cas d'erreur interne du serveur.

## Change Log

| Date       | Version | Description                                                                                                                            | Auteur                            |
| :--------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------- |
| 2025-05-11 | 0.1     | Création initiale du document de référence API. Description de la Metrics API interne (endpoints de partage et de feedback d'utilité). Suppression de la section SDK Cloud non applicable au MVP. | 3 - Architecte (IA) & Utilisateur |