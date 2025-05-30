# Story 2.5: Logique pour Récupérer les Traductions d'un Article

**Status:** Draft

## Goal & Context

**User Story:** En tant que Développeur Frontend (DevFE), je veux implémenter la logique pour récupérer toutes les traductions disponibles d'un article donné en utilisant le `translationId` afin de pouvoir afficher les liens vers les autres versions linguistiques de l'article sur la page de l'article.

**Context:** Cette story technique est une composante essentielle de l'Epic 2. Elle permet de lier les différentes versions linguistiques d'un même contenu, ce qui sera utilisé par le sélecteur de langue spécifique à l'article (Story 2.7). Elle s'appuie sur la structure de contenu et le champ `translationId` définis dans les Stories 2.1 et 2.2.

## Detailed Requirements

Créer une fonction utilitaire (par exemple, dans `frontend/src/lib/i18nUtils.ts` ou `frontend/src/lib/blogUtils.ts`). Cette fonction prendra en entrée les informations d'un article actuel (ou son `translationId` et sa `langue` actuelle) et retournera une liste (ou un objet) des autres versions linguistiques disponibles de cet article, en interrogeant la collection Astro `blog`.

## Acceptance Criteria (ACs)

- AC1: Une fonction utilitaire (ex: `getTranslatedArticles(currentPost: CollectionEntry<'blog'>)` ou `getTranslatedArticles(translationId: string, currentLang: string)`) est créée.
- AC2: La fonction utilise `getCollection('blog', ...)` d'Astro pour filtrer les articles ayant le même `translationId` que l'article courant.
- AC3: La fonction exclut l'article courant (même langue) de la liste des traductions retournées.
- AC4: La fonction retourne les informations nécessaires pour créer des liens vers les traductions (ex: `slug`, `lang`, `title`).
- AC5: La fonction est testable (potentiellement avec des données mockées de la collection Astro).
- AC6: La documentation de la fonction (JSDoc) explique son usage, ses paramètres et ce qu'elle retourne.

## Technical Implementation Context

**Guidance:** Utiliser l'API `getCollection` d'Astro pour accéder aux données des articles.

- **Relevant Files:**
  - Files to Create:
    - `frontend/src/lib/i18nUtils.ts` (ou `frontend/src/lib/blogUtils.ts` ou un nom similaire pour les utilitaires liés au blog/i18n).
    - Potentiellement un fichier de test pour cette fonction utilitaire.
  - _(Hint: Consulter la documentation Astro sur `getCollection`. Se référer à `docs/bilinguisme/gestion-contenu.md` Section 4.1.)_

- **Key Technologies:**
  - Astro (API `getCollection`)
  - TypeScript
  - _(Hint: Voir `docs/teck-stack.md`)_

- **API Interactions / SDK Usage:**
  - Non applicable pour cette story.

- **UI/UX Notes:**
  - Fonction de backend logique pour le frontend ; pas d'impact UI direct dans cette story.

- **Data Structures:**
  - Manipule les objets `CollectionEntry<'blog'>` d'Astro.
  - Le retour de la fonction pourrait être un tableau d'objets contenant `{ lang: string, slug: string, title: string }`.

- **Environment Variables:**
  - Non applicable pour cette story.

- **Coding Standards Notes:**
  - La fonction doit être pure et bien documentée.
  - Utiliser des types TypeScript clairs pour les paramètres et les valeurs de retour.
  - _(Hint: Voir `docs/normes-codage.md`)_

## Tasks / Subtasks

- [ ] Créer le fichier `frontend/src/lib/i18nUtils.ts` (ou un nom approprié).
- [ ] Implémenter la fonction `getTranslatedArticles`. Exemple de signature et de logique :
    ```typescript
    // frontend/src/lib/i18nUtils.ts
    import { getCollection, type CollectionEntry } from 'astro:content';

    export interface TranslatedArticleLink {
      lang: string;
      slug: string; // Ou l'URL complète si générée ici
      title: string; // Titre de l'article traduit, pour l'affichage du lien
    }

    /**
     * Récupère les liens vers les versions traduites d'un article donné.
     * @param currentPost L'entrée de collection de l'article actuel.
     * @returns Un tableau d'objets TranslatedArticleLink pour chaque traduction disponible.
     */
    export async function getTranslatedArticles(
      currentPost: CollectionEntry<'blog'>
    ): Promise<TranslatedArticleLink[]> {
      if (!currentPost.data.translationId) {
        return [];
      }

      const allBlogPosts = await getCollection('blog');
      const translations = allBlogPosts.filter(post => 
        post.data.translationId === currentPost.data.translationId && post.data.lang !== currentPost.data.lang
      );

      return translations.map(post => ({
        lang: post.data.lang,
        // Pour le slug, il faut construire l'URL complète. 
        // Astro.glob ou getEntryBySlug ne sont pas directement utilisables ici sans plus de contexte.
        // Le plus simple est de retourner le slug et la langue, et le composant qui l'utilise construira l'URL.
        slug: post.slug, // Le slug de la page traduite (incluant le préfixe de langue si Astro le gère ainsi)
                         // Ou `post.data.slug` si c'est le slug du frontmatter qu'on veut pour construire l'URL
        title: post.data.title, 
      }));
    }
    ```
    *Note importante sur `post.slug` : Le `slug` retourné par `getCollection` est généralement le chemin de fichier relatif sans l'extension. Il faudra une logique dans le composant consommateur (Story 2.7) pour construire l'URL correcte (ex: `/${post.data.lang}/blog/${post.data.slug || post.slugFromFile}/`). Pour l'instant, retourner le `slug` du frontmatter (s'il existe) ou le `slug` dérivé du nom de fichier est une bonne base.*
- [ ] Ajouter la documentation JSDoc à la fonction.
- [ ] (Optionnel mais recommandé) Écrire des tests unitaires pour cette fonction en mockant `getCollection` ou en utilisant un petit ensemble de données de test.
- [ ] S'assurer que la fonction est exportée et peut être importée dans d'autres parties du code Astro.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.
- **Unit Tests (Recommandé):**
  - Créer des mocks pour `getCollection` retournant différents scénarios (pas de traductions, une traduction, plusieurs traductions).
  - Vérifier que la fonction filtre correctement l'article actuel.
  - Vérifier que les données retournées (lang, slug, title) sont correctes.
- **Manual Verification (via intégration dans une page de test si pas de TU):**
  - Créer une page Astro de test qui importe et appelle cette fonction avec un `translationId` existant et affiche le résultat.
  - Vérifier que les traductions attendues sont listées.
- _(Hint: Voir `docs/strategie-tests.md`)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed, notamment sur la construction de l'URL finale à partir du slug retourné.}
- **Change Log:**
  - Initial Draft