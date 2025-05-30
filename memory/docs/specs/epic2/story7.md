# Story 2.7: Sélecteur de Langue Spécifique aux Articles

**Status:** Draft

## Goal & Context

**User Story:** En tant qu'Utilisateur, je veux voir et utiliser un sélecteur de langue spécifique sur chaque page d'article pour passer aux traductions directes de cet article afin d'accéder facilement à la version de l'article dans une autre langue si elle existe.

**Context:** Cette story de l'Epic 2 s'appuie sur la logique de récupération des traductions (Story 2.5) et le routage i18n (Story 2.3). Elle offre une navigation linguistique contextuelle directement sur les pages de contenu principal.

## Detailed Requirements

Créer un composant Astro `ArticleLanguageSwitcher.astro` qui sera intégré dans le layout des pages d'articles. Ce composant utilisera la fonction `getTranslatedArticles` (de la Story 2.5) pour trouver les versions traduites de l'article actuel. Il affichera des liens vers ces traductions. Le design doit être conforme à `docs/ui-ux/ui-ux-spec.md`.

## Acceptance Criteria (ACs)

- AC1: Un composant `frontend/src/components/article/ArticleLanguageSwitcher.astro` (ou nom similaire) est créé.
- AC2: Le composant prend en entrée l'objet de l'article actuel (`CollectionEntry<'blog'>`).
- AC3: Il utilise la fonction `getTranslatedArticles` pour obtenir la liste des traductions disponibles.
- AC4: Pour chaque traduction trouvée, il affiche un lien pointant vers l'URL correcte de l'article traduit (ex: `/${translation.lang}/blog/${translation.slug}/`).
- AC5: Si aucune traduction n'est disponible pour une langue donnée, aucun lien n'est affiché pour cette langue (ou un message approprié est affiché, mais pour le MVP, ne rien afficher est plus simple).
- AC6: Le design du sélecteur est conforme à `docs/ui-ux/ui-ux-spec.md` (potentiellement plus discret que le sélecteur global, intégré dans la zone de métadonnées ou en fin d'article).
- AC7: Le composant est intégré dans le layout des pages d'articles (qui sera créé dans l'Epic 3).

## Technical Implementation Context

**Guidance:** Le composant récupérera les données de l'article actuel via ses props Astro. Il appellera la fonction utilitaire de la Story 2.5.

- **Relevant Files:**
  - Files to Create:
    - `frontend/src/components/article/ArticleLanguageSwitcher.astro`
  - Files to Modify (dans Epic 3):
    - Le futur layout des pages d'article (ex: `frontend/src/layouts/ArticleLayout.astro` ou `frontend/src/pages/[lang]/blog/[slug].astro`) pour intégrer ce composant.
  - Files to Use:
    - `frontend/src/lib/i18nUtils.ts` (ou équivalent, contenant `getTranslatedArticles`)
  - _(Hint: Se référer à `docs/bilinguisme/gestion-contenu.md` Section 4.3 et `docs/ui-ux/ui-ux-spec.md` pour les spécifications de design.)_

- **Key Technologies:**
  - Astro (composants, props)
  - TypeScript
  - HTML, CSS (TailwindCSS/DaisyUI)
  - _(Hint: Voir `docs/teck-stack.md`)_

- **API Interactions / SDK Usage:**
  - Non applicable pour cette story.

- **UI/UX Notes:**
  - Le sélecteur doit être clairement identifiable mais ne pas surcharger la page de l'article.
  - Les liens doivent indiquer la langue de la traduction.

- **Data Structures:**
  - Utilise `CollectionEntry<'blog'>` en entrée et la structure `TranslatedArticleLink` (ou similaire) retournée par `getTranslatedArticles`.

- **Environment Variables:**
  - Non applicable pour cette story.

- **Coding Standards Notes:**
  - Le composant doit être bien encapsulé.
  - _(Hint: Voir `docs/normes-codage.md`)_

## Tasks / Subtasks

- [ ] Créer le fichier `frontend/src/components/article/ArticleLanguageSwitcher.astro`.
- [ ] Définir les props du composant (il aura besoin de l'objet `post` de type `CollectionEntry<'blog'>`).
- [ ] Dans le script du composant, appeler `getTranslatedArticles(Astro.props.post)` pour récupérer les traductions.
- [ ] Itérer sur les traductions retournées et générer les liens. L'URL du lien sera construite comme `/${translation.lang}/blog/${translation.slugFromFrontmatter || translation.slugFromFile}/`.
    ```astro
    ---
    // frontend/src/components/article/ArticleLanguageSwitcher.astro
    import type { CollectionEntry } from 'astro:content';
    import { getTranslatedArticles, type TranslatedArticleLink } from '../../lib/i18nUtils'; // Adapter le chemin

    export interface Props {
      post: CollectionEntry<'blog'>;
    }

    const { post } = Astro.props;
    const translations: TranslatedArticleLink[] = await getTranslatedArticles(post);
    ---
    {translations && translations.length > 0 && (
      <div class="article-language-switcher my-4 p-2 border rounded">
        <p class="font-semibold text-sm mb-1">Lire cet article en :</p> {/* TODO: Traduire cette chaîne UI */}
        <ul class="flex space-x-2">
          {translations.map(translation => {
            // Construire l'URL: on assume que le slug du frontmatter (data.slug) est prioritaire
            // et que le routing d'Astro gère le reste pour les collections
            const targetSlug = post.collection === 'blog' ? (translation.slug) : translation.slug; // slug est déjà le bon ici basé sur la fonction
            const targetUrl = `/${translation.lang}/blog/${targetSlug}/`; 
            const flag = translation.lang === 'fr' ? '🇫🇷' : '🇬🇧';
            return (
              <li>
                <a href={targetUrl} class="link link-hover text-sm">
                  {flag} {translation.title} ({translation.lang.toUpperCase()})
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    )}
    ```
- [ ] Appliquer un style minimal conforme aux spécifications UI/UX.
- [ ] (Pour test pendant le développement de cette story) Intégrer temporairement ce composant dans une page d'article existante (ex: un des fichiers MDX d'exemple en le modifiant pour qu'il utilise un layout qui inclut ce switcher, ou dans `src/pages/index.astro` en lui passant un `post` mocké). Le test final se fera lorsque le layout des articles de l'Epic 3 sera prêt.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.
- **Manual/Visual Verification (dans un layout de test ou lors de l'intégration dans Epic 3):**
  - Sur une page d'article ayant des traductions, vérifier que les liens vers les autres langues s'affichent correctement.
  - Vérifier que les URLs des liens sont correctes et mènent aux bons articles traduits.
  - Sur une page d'article n'ayant pas de traductions, vérifier que le sélecteur ne s'affiche pas ou indique qu'il n'y a pas d'autres versions.
  - S'assurer que le design est conforme à `docs/ui-ux/ui-ux-spec.md`.
- _(Hint: Voir `docs/strategie-tests.md`)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed. Noter que la construction de l'URL exacte dépend de la configuration de génération des pages d'articles d'Astro et du slug utilisé (nom de fichier vs slug du frontmatter).}
- **Change Log:**
  - Initial Draft