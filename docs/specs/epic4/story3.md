# Story 4.03: Implémenter entité ArticleVersionMetric et Repository JPA

**Status:** Draft

## Goal & Context

**User Story:** En tant que DevBE, je veux m'assurer que l'entité `ArticleVersionMetric` et son repository JPA sont correctement implémentés pour stocker les compteurs, afin d'avoir un moyen persistant et fiable de stocker les métriques de partage et de feedback.

**Context:** Cette story est fondamentale pour le backend de l'Epic 4. Elle fournit la structure de données et la couche d'accès nécessaires pour que les stories E4-B01 et E4-B02 puissent persister les informations de comptage.

## Detailed Requirements

Définir et implémenter l'entité JPA `ArticleVersionMetric` pour PostgreSQL, ainsi que son interface Spring Data JPA Repository. L'entité doit inclure les champs pour l'identification de l'article (`articleCanonicalSlug`, `lang`), les compteurs (`shareCount`, `usefulYesCount`, `usefulNoCount`), et les timestamps de création/mise à jour.

## Acceptance Criteria (ACs)

- AC1: L'entité Java `ArticleVersionMetric.java` est créée dans le package `fr.kalifazzia.blogtechnique.metrics.entity`.
- AC2: L'entité est annotée avec `@Entity` et mappée à la table `article_version_metrics` (nom de table exact comme dans `docs/architecture/data-models.md`).
- AC3: Les champs suivants sont présents avec les types et contraintes appropriés (basé sur `docs/architecture/data-models.md`):
    - `id` (Long, clé primaire, stratégie de génération `SEQUENCE` avec séquence `article_version_metrics_id_seq` et `allocationSize = 50`).
    - `articleCanonicalSlug` (String, non nul, longueur max 120).
    - `articleLang` (String, non nul, longueur max 20).
    - `shareCount` (int, non nul, valeur par défaut 0).
    - `usefulYesCount` (int, non nul, valeur par défaut 0).
    - `usefulNoCount` (int, non nul, valeur par défaut 0).
    - `createdAt` (OffsetDateTime, non nul, non modifiable, géré par JPA Auditing `@CreatedDate`).
    - `lastUpdatedAt` (OffsetDateTime, non nul, géré par JPA Auditing `@LastModifiedDate`).
- AC4: Une contrainte d'unicité (`@UniqueConstraint`) est définie sur la combinaison des colonnes `article_canonical_slug` et `article_lang`, nommée `uk_article_version_metrics_slug_lang`.
- AC5: Lombok est utilisé pour les getters, setters, constructeurs (`@NoArgsConstructor`, `@Builder`), `equals()`, `hashCode()` (basé sur `articleCanonicalSlug` et `articleLang`), et `toString()` (sélectif).
- AC6: L'interface `ArticleVersionMetricRepository.java` est créée dans `fr.kalifazzia.blogtechnique.metrics.repository`, étendant `JpaRepository<ArticleVersionMetric, Long>`.
- AC7: Le repository inclut une méthode pour rechercher par `articleCanonicalSlug` et `articleLang`: `Optional<ArticleVersionMetric> findByArticleCanonicalSlugAndArticleLang(String articleCanonicalSlug, String articleLang);`.
- AC8: La configuration pour JPA Auditing (`@EnableJpaAuditing` et potentiellement `JpaAuditingConfiguration`) est en place pour que `@CreatedDate` et `@LastModifiedDate` fonctionnent.
- AC9: Le script de migration Liquibase (`001-create-article-version-metrics-table.sql` ou similaire) est créé/vérifié pour correspondre à la structure de l'entité, incluant la séquence et la contrainte d'unicité.

## Technical Implementation Context

**Guidance:** Utiliser les détails suivants pour l'implémentation. Consulter les fichiers `docs/` liés pour un contexte plus large si nécessaire.

- **Relevant Files:**
  - Files to Create:
    - `backend/src/main/java/fr/kalifazzia/blogtechnique/metrics/entity/ArticleVersionMetric.java`
    - `backend/src/main/java/fr/kalifazzia/blogtechnique/metrics/repository/ArticleVersionMetricRepository.java`
    - `backend/src/main/java/fr/kalifazzia/blogtechnique/config/JpaAuditingConfig.java` (si pas déjà existant)
    - `backend/src/main/resources/db/changelog/changes/001-create-article-version-metrics-table.sql` (ou vérifier/ajuster si existant depuis `docs/architecture/data-models.md`)
  - _(Hint: Voir `docs/project-structure.md` pour la structure globale)_

- **Key Technologies:**
  - Java 21, Spring Boot, Spring Data JPA, PostgreSQL, Lombok, Liquibase.
  - _(Hint: Voir `docs/architecture/tech-stack.md` pour la liste complète)_

- **API Interactions / SDK Usage:** Non applicable directement.

- **UI/UX Notes:** Non applicable pour cette story backend.

- **Data Structures:**
  - La définition de `ArticleVersionMetric` et le script SQL correspondant sont primordiaux, basés sur `docs/architecture/data-models.md`.

- **Environment Variables:**
  - Configuration de la datasource PostgreSQL (ex: `SPRING_DATASOURCE_URL`, `_USERNAME`, `_PASSWORD`) est prérequise (gérée dans Epic 1).
  - _(Hint: Voir `docs/setup/environnement-vars.md` pour toutes les variables)_

- **Coding Standards Notes:**
  - Suivre les conventions de nommage JPA et Java.
  - Utiliser les annotations Lombok de manière appropriée.
  - _(Hint: Voir `docs/contribution/normes-codage.md` pour les standards complets)_

## Tasks / Subtasks

- [ ] Créer la classe d'entité `ArticleVersionMetric.java` avec tous les champs, annotations JPA (`@Entity`, `@Table`, `@Id`, `@GeneratedValue`, `@SequenceGenerator`, `@Column`, `@UniqueConstraint`, `@CreatedDate`, `@LastModifiedDate`, `@EntityListeners`).
- [ ] Ajouter les annotations Lombok (`@Getter`, `@Setter`, `@NoArgsConstructor`, `@Builder`, `@EqualsAndHashCode`, `@ToString`). Configurer `@EqualsAndHashCode` et `@ToString` comme spécifié.
- [ ] Créer l'interface `ArticleVersionMetricRepository.java` étendant `JpaRepository` et ajouter la méthode `findByArticleCanonicalSlugAndArticleLang`.
- [ ] S'assurer que la configuration `JpaAuditingConfig.java` (avec `@Configuration` et `@EnableJpaAuditing`) est présente.
- [ ] Vérifier ou créer le script de migration Liquibase pour la table `article_version_metrics` et sa séquence, en s'assurant qu'il correspond à l'entité et aux spécifications de `docs/architecture/data-models.md`.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.

- **Unit Tests:**
  - Pas de logique métier complexe dans l'entité ou le repository lui-même à tester unitairement au-delà de ce que Spring Data JPA fournit.
  - On peut tester la configuration de `@EqualsAndHashCode` et `@ToString` si des comportements spécifiques sont attendus.
- **Integration Tests (Spring Data JPA Tests):**
  - Utiliser `@DataJpaTest` pour tester le `ArticleVersionMetricRepository`.
  - Scénario : Sauvegarder une nouvelle entité `ArticleVersionMetric` et la récupérer.
  - Scénario : Vérifier que la contrainte d'unicité sur (`articleCanonicalSlug`, `lang`) fonctionne (tenter d'insérer un doublon).
  - Scénario : Vérifier que les champs `createdAt` et `lastUpdatedAt` sont automatiquement remplis par JPA Auditing lors de la sauvegarde et de la mise à jour.
  - Scénario : Tester la méthode `findByArticleCanonicalSlugAndArticleLang` (cas trouvé et non trouvé).
- **Schema Validation:**
  - Vérifier que le schéma généré par Hibernate (si `spring.jpa.hibernate.ddl-auto` est utilisé en dev/test) correspond au script Liquibase.
  - S'assurer que Liquibase applique correctement les migrations sur une base de test (via Testcontainers ou H2 configuré pour PostgreSQL).
- _(Hint: Voir `docs/tests/strategie-tests.md` pour l'approche globale)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:**
- **Change Log:**
  - Initial Draft