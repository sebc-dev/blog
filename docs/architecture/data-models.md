# Blog Technique Bilingue - Modèles de Données

Ce document détaille les modèles de données pour le Blog Technique Bilingue, en se concentrant sur les entités gérées par le backend pour les fonctionnalités de comptage du MVP.

## 1. Entités de Domaine Applicatif (Backend Spring Boot)

L'entité principale gérée par le backend concerne les métriques associées à chaque version linguistique d'un article.

### ArticleVersionMetric

-   **Description :** Représente les compteurs anonymes de partage et de feedback d'utilité pour une version linguistique spécifique d'un article de blog. Chaque article est identifié par un `articleCanonicalSlug` unique (par exemple, un slug stable généré par Astro, indépendant de la langue, ex: "mon-super-article-tauri") et par sa langue (`articleLang`). Utilise Lombok pour la génération de code. Les timestamps de création et de mise à jour sont gérés par Spring Data JPA Auditing. La clé primaire utilise une stratégie de séquence PostgreSQL pour optimiser les insertions par lots.
-   **Schéma / Définition de la Classe Java (JPA Entity avec Lombok et Builder) :**
    ```java
    // package com.example.blog.metrics.entity; // Exemple de package

    import jakarta.persistence.*;
    import lombok.Builder;
    import lombok.Getter;
    import lombok.NoArgsConstructor;
    import lombok.Setter;
    import lombok.ToString;
    import lombok.EqualsAndHashCode;
    import org.springframework.data.annotation.CreatedDate;
    import org.springframework.data.annotation.LastModifiedDate;
    import org.springframework.data.jpa.domain.support.AuditingEntityListener;

    import java.time.OffsetDateTime;
    // import java.time.ZoneOffset; // Plus nécessaire si Spring Data JPA gère l'UTC par défaut ou via config

    @Getter
    @Setter
    @NoArgsConstructor // Requis par JPA
    @Builder // Active le pattern Builder
    @EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false) // Basé sur la clé métier
    @ToString(onlyExplicitlyIncluded = true, callSuper = false) // Pour un logging sélectif
    @Entity
    @Table(name = "article_version_metrics", uniqueConstraints = {
            @UniqueConstraint(columnNames = {"article_canonical_slug", "article_lang"}, name = "uk_article_version_metrics_slug_lang") // Nom de contrainte mis à jour
    })
    @EntityListeners(AuditingEntityListener.class) // Pour @CreatedDate et @LastModifiedDate
    public class ArticleVersionMetric {

        @Id
        @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "article_version_metrics_id_seq_gen")
        @SequenceGenerator(name = "article_version_metrics_id_seq_gen", sequenceName = "article_version_metrics_id_seq", allocationSize = 50)
        @ToString.Include // Inclure l'ID dans toString
        private Long id;

        @EqualsAndHashCode.Include // Fait partie de la clé métier pour l'égalité
        @ToString.Include
        @Column(name = "article_canonical_slug", nullable = false, length = 120) // Longueur ajustée
        private String articleCanonicalSlug;

        @EqualsAndHashCode.Include // Fait partie de la clé métier pour l'égalité
        @ToString.Include
        @Column(name = "article_lang", nullable = false, length = 20) // Longueur ajustée
        private String articleLang;

        @Builder.Default
        @ToString.Include
        @Column(name = "share_count", nullable = false)
        private int shareCount = 0;

        @Builder.Default
        @ToString.Include
        @Column(name = "useful_yes_count", nullable = false)
        private int usefulYesCount = 0;

        @Builder.Default
        @ToString.Include
        @Column(name = "useful_no_count", nullable = false)
        private int usefulNoCount = 0;

        @CreatedDate // Géré par Spring Data JPA Auditing
        @Column(name = "created_at", nullable = false, updatable = false)
        private OffsetDateTime createdAt;

        @LastModifiedDate // Géré par Spring Data JPA Auditing
        @Column(name = "last_updated_at", nullable = false)
        private OffsetDateTime lastUpdatedAt;

        // Méthodes de manipulation d'état (Modèle de Domaine Modérément Riche)
        public void incrementShareCount() {
            this.shareCount++;
        }

        public void incrementUsefulYesCount() {
            this.usefulYesCount++;
        }

        public void incrementUsefulNoCount() {
            this.usefulNoCount++;
        }

        // Note pour l'implémentation Spring Boot :
        // S'assurer qu'une classe de configuration avec @EnableJpaAuditing existe.
        // Exemple :
        // @Configuration
        // @EnableJpaAuditing
        // public class JpaConfig {
        //     // Optionnel : pour s'assurer que OffsetDateTime est bien géré en UTC
        //     // @Bean
        //     // public AuditorAware<String> auditorProvider() {
        //     //     return () -> Optional.of("system"); // ou un utilisateur authentifié si applicable
        //     // }
        //     // Normalement, Spring Boot configure OffsetDateTime pour utiliser UTC avec PostgreSQL
        //     // si la propriété spring.jpa.properties.hibernate.jdbc.time_zone=UTC est définie
        //     // ou si le driver JDBC gère cela correctement par défaut.
        // }
    }
    ```

## 2. Schéma de Base de Données et Migrations (PostgreSQL avec Liquibase)

Les scripts suivants sont des exemples de changesets Liquibase pour créer et maintenir le schéma de la table `article_version_metrics`.

### Changeset Initial : Création de la table `article_version_metrics` et de la séquence

-   **Objectif :** Créer la table principale pour stocker les métriques et la séquence pour les IDs.
-   **Fichier Liquibase (exemple) :** `db/changelog/001-create-article-version-metrics-table.sql`

    ```sql
    -- liquibase formatted sql

    -- changeset architect:1715357000000-1 failOnError:true
    -- comment: Create sequence for article_version_metrics primary key
    CREATE SEQUENCE article_version_metrics_id_seq
        START WITH 1
        INCREMENT BY 50 -- Doit correspondre à allocationSize dans @SequenceGenerator
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;
    -- rollback DROP SEQUENCE IF EXISTS article_version_metrics_id_seq;

    -- changeset architect:1715357000000-2 failOnError:true
    -- comment: Create article_version_metrics table
    CREATE TABLE article_version_metrics (
        id BIGINT NOT NULL DEFAULT nextval('article_version_metrics_id_seq'::regclass), -- Utilise la séquence pour la valeur par défaut
        article_canonical_slug VARCHAR(120) NOT NULL, -- Longueur ajustée
        article_lang VARCHAR(20) NOT NULL,           -- Longueur ajustée
        share_count INTEGER NOT NULL DEFAULT 0,
        useful_yes_count INTEGER NOT NULL DEFAULT 0,
        useful_no_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL, -- Géré par l'application (Spring Data JPA Auditing)
        last_updated_at TIMESTAMPTZ NOT NULL, -- Géré par l'application (Spring Data JPA Auditing)
        CONSTRAINT pk_article_version_metrics PRIMARY KEY (id),
        CONSTRAINT uk_article_version_metrics_slug_lang UNIQUE (article_canonical_slug, article_lang) -- Nom de contrainte mis à jour, crée un index automatiquement
    );
    -- rollback DROP TABLE IF EXISTS article_version_metrics;

    -- Note : L'index manuel "idx_article_version_metrics_slug_lang" a été supprimé
    -- car il est redondant avec l'index créé par la contrainte d'unicité "uk_article_version_metrics_slug_lang".

    -- Note sur les index futurs (Post-MVP) :
    -- Pour le suivi et l'administration (post-MVP) :
    -- Un index sur (last_updated_at DESC) pourrait être ajouté :
    -- CREATE INDEX idx_avm_last_updated_at_desc ON article_version_metrics(last_updated_at DESC);
    --
    -- Pour les fonctionnalités de popularité/classement (post-MVP) :
    -- Des index sur les compteurs (ex: share_count DESC) pourraient être ajoutés :
    -- CREATE INDEX idx_avm_share_count_desc ON article_version_metrics(share_count DESC);
    -- CREATE INDEX idx_avm_useful_yes_count_desc ON article_version_metrics(useful_yes_count DESC);
    -- CREATE INDEX idx_avm_useful_no_count_desc ON article_version_metrics(useful_no_count DESC);
    ```

## 3. Interactions API et DTOs (Data Transfer Objects)

Cette section décrit les DTOs pour les interactions API liées aux métriques.

### `ArticleFeedbackPayload` (Requête)

-   **Description :** Payload utilisé par le client pour soumettre un feedback d'utilité.
-   **Définition Java :**
    ```java
    // package com.example.blog.metrics.dto; // Exemple de package

    // import jakarta.validation.constraints.NotNull; // Si l'enum ne doit pas être nul

    public class ArticleFeedbackPayload {

        // @NotNull // Décommenter si le vote est obligatoire
        private FeedbackVote vote;

        public FeedbackVote getVote() {
            return vote;
        }

        public void setVote(FeedbackVote vote) {
            this.vote = vote;
        }
    }
    ```

### `FeedbackVote` (Enum)

-   **Description :** Enum représentant les options de vote possibles.
-   **Définition Java :**
    ```java
    // package com.example.blog.metrics.dto; // Exemple de package

    import com.fasterxml.jackson.annotation.JsonValue;

    public enum FeedbackVote {
        YES("yes"),
        NO("no");

        private final String value;

        FeedbackVote(String value) {
            this.value = value;
        }

        @JsonValue // Permet à Jackson de sérialiser/désérialiser vers/depuis la valeur de la chaîne
        public String getValue() {
            return value;
        }

        // Optionnel: une méthode pour désérialiser de manière insensible à la casse si besoin,
        // bien que @JsonValue sur la valeur en minuscules soit souvent suffisant avec une configuration Jackson appropriée.
        // @JsonCreator
        // public static FeedbackVote fromString(String value) {
        //     if (value == null) {
        //         return null;
        //     }
        //     for (FeedbackVote voteValue : FeedbackVote.values()) {
        //         if (voteValue.getValue().equalsIgnoreCase(value)) {
        //             return voteValue;
        //         }
        //     }
        //     throw new IllegalArgumentException("Invalid vote value: " + value);
        // }
    }
    ```

### Schémas de Réponse API (Exemples)

-   **Pour `POST /api/v1/metrics/article/{articleCanonicalSlug}/{lang}/share` (Succès `200 OK`) :**
    ```json
    {
      "shareCount": 124 
    }
    ```
-   **Pour `POST /api/v1/metrics/article/{articleCanonicalSlug}/{lang}/feedback` (Succès `200 OK`) :**
    ```json
    {
      "usefulYesCount": 88,
      "usefulNoCount": 12
    }
    ```

## 4. Change Log

| Date       | Version | Description                                                                                                                                                                                                                        | Auteur                            |
| :--------- | :------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------- |
| 2025-05-10 | 0.1     | Création initiale du document.                                                                                                                                                                                                     | 3 - Architecte (IA) & Utilisateur |
| 2025-05-10 | 0.2     | Modification pour inclure `article_lang` dans les métriques et API. Timestamps gérés par l'application (JPA).                                                                                                                      | 3 - Architecte (IA)               |
| 2025-05-10 | 0.3     | Adaptation de l'entité Java `ArticleVersionMetric` pour utiliser Lombok.                                                                                                                                                           | 3 - Architecte (IA)               |
| 2025-05-10 | 0.4     | Utilisation de `@Builder` (Lombok) pour l'entité `ArticleVersionMetric` et ajustements constructeur/timestamps.                                                                                                                    | 3 - Architecte (IA)               |
| 2025-05-10 | 0.5     | Intégration des recommandations du rapport d'optimisation : Stratégie de clé primaire SEQUENCE, config Lombok, audit JPA pour timestamps, ajustement longueurs champs, méthodes métier dans entité, nettoyage index SQL, DTOs API. | 3 - Architecte (IA)               |