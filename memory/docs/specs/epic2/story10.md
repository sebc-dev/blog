# Story 2.10: Génération des Balises `hreflang`

**Status:** Draft

## Goal & Context

**User Story:** En tant qu'Admin/DevFE, je veux que le site génère automatiquement les balises `link rel="alternate" hreflang="x"` correctes pour toutes les pages ayant des versions linguistiques afin d'indiquer aux moteurs de recherche les URL alternatives pour chaque langue, améliorant le ciblage linguistique et évitant les problèmes de contenu dupliqué.

**Context:** Cette story de l'Epic 2 est cruciale pour le SEO international du blog bilingue. Elle permet aux moteurs de recherche de comprendre la relation entre les différentes versions linguistiques d'une même page.

## Detailed Requirements

Implémenter la logique dans les layouts Astro (base et/ou article) pour générer dynamiquement les balises `<link rel="alternate" hreflang="..." href="...">`. Cela inclut les liens pour chaque langue supportée, ainsi qu'un lien `hreflang="x-default"` pointant vers la version par défaut (ex: anglais). Les URLs doivent être absolues. La logique doit pouvoir trouver les URLs correspondantes des pages traduites.

## Acceptance Criteria (ACs)

- AC1: Pour chaque page du site (accueil, pages statiques, pages d'articles), les balises `link rel="alternate" hreflang="en" href="URL_EN"` et `link rel="alternate" hreflang="fr" href="URL_FR"` sont générées dans le `<head>` si les deux versions existent.
- AC2: Une balise `link rel="alternate" hreflang="x-default" href="URL_LANGUE_PAR_DEFAUT"` est générée, pointant vers la version de la langue par défaut du site (ex: anglais).
- AC3: Les URLs dans les attributs `href` sont absolues (utilisant `Astro.site`).
- AC4: La logique de génération des URLs des pages traduites est correcte :
    - Pour les articles, elle utilise le `translationId` et les `slug` des versions traduites.
    - Pour les pages statiques (ex: "À Propos"), elle utilise un mappage de slugs si les slugs diffèrent entre les langues, ou reconstruit l'URL si les slugs sont identiques (juste le préfixe de langue change).
- AC5: La documentation dans `docs/bilinguisme/gestion-contenu.md` (Section 7.2) et `docs/seo/strategie-seo.md` (Section 2) est mise à jour.

## Technical Implementation Context

**Guidance:** La logique sera probablement placée dans `BaseLayout.astro` ou un composant dédié inséré dans le `<head>`. Elle devra accéder à `Astro.url`, `Astro.currentLocale`, `Astro.locales`, et potentiellement la fonction `getTranslatedArticles` (pour les pages d'articles) ou un système de mappage pour les pages statiques.

- **Relevant Files:**
  - Files to Modify:
    - `frontend/src/layouts/BaseLayout.astro` (ou un composant spécifique pour le `<head>`)
  - Files to Use/Reference:
    - `frontend/src/lib/i18nUtils.ts` (si `getTranslatedArticles` est utilisé ici)
    - La configuration i18n dans `frontend/astro.config.mjs` (pour `Astro.site`, `locales`, `defaultLocale`)
    - `docs/bilinguisme/gestion-contenu.md`
    - `docs/seo/strategie-seo.md`
  - _(Hint: Astro ne fournit pas d'utilitaire direct pour `hreflang` sur toutes les pages aussi facilement que pour `sitemap`, une logique custom est souvent nécessaire.)_

- **Key Technologies:**
  - Astro (API `Astro.url`, `Astro.site`, `Astro.currentLocale`, `Astro.config.i18n`)
  - HTML (balises `<link>`)
  - TypeScript/JavaScript (pour la logique de génération)
  - _(Hint: Voir `docs/teck-stack.md`)_

- **API Interactions / SDK Usage:**
  - Non applicable pour cette story.

- **UI/UX Notes:**
  - Invisible à l'utilisateur, mais impacte fortement le SEO.

- **Data Structures:**
  - Potentiel objet de mappage pour les URLs des pages statiques traduites.

- **Environment Variables:**
  - `PUBLIC_SITE_URL` (via `Astro.site` qui devrait être configuré dans `astro.config.mjs` et qui peut lire cette variable).

- **Coding Standards Notes:**
  - La logique de génération des URLs doit être robuste et couvrir tous les cas de figure.
  - _(Hint: Voir `docs/normes-codage.md`)_

## Tasks / Subtasks

- [ ] Définir comment identifier la page actuelle et trouver ses traductions :
    - Pour les articles de blog : La prop `post` (passée au layout d'article) contient `translationId`. Utiliser `getTranslatedArticles` (Story 2.5).
    - Pour les pages statiques (ex: `/about`, `/a-propos`) : Mettre en place un système de mappage des URLs traduites.
      Exemple de structure de mappage (peut être dans un fichier `src/lib/pageTranslations.ts`) :
      ```typescript
      // src/lib/pageTranslations.ts
      export const pageTranslations = {
        '/en/': { fr: '/fr/' },
        '/fr/': { en: '/en/' },
        '/en/about/': { fr: '/fr/a-propos/' },
        '/fr/a-propos/': { en: '/en/about/' },
        '/en/blog/': { fr: '/fr/blog/' }, // Pour les pages de listing
        '/fr/blog/': { en: '/en/blog/' },
        // etc. pour chaque page statique ou de listing
      };
      ```
- [ ] Dans `frontend/src/layouts/BaseLayout.astro` (ou un composant dédié pour le head) :
    - Récupérer `Astro.url`, `Astro.site`, `Astro.currentLocale`, et `Astro.config.i18n.locales` et `Astro.config.i18n.defaultLocale`.
    - Déterminer si la page actuelle est un article de blog (ex: si une prop `post` est passée au layout).
    - Si c'est un article, utiliser `getTranslatedArticles` pour obtenir les slugs/langues des traductions. Construire les URLs absolues.
    - Si c'est une page statique, utiliser le mappage `pageTranslations` pour obtenir les URLs absolues des traductions.
    - Générer les balises `<link rel="alternate" hreflang="{locale}" href="{absoluteUrl}">` pour chaque locale disponible.
    - Générer la balise `<link rel="alternate" hreflang="x-default" href="{absoluteUrlOfDefaultLocale}">`.
    ```astro
    ---
    // Dans BaseLayout.astro ou un composant Head.astro
    // Props (exemple si la page actuelle est un article)
    // export interface Props { post?: CollectionEntry<'blog'>; /* ... autres props ... */ }
    // const { post } = Astro.props;

    import { getTranslatedArticles, type TranslatedArticleLink } from '../lib/i18nUtils'; // Si applicable
    import { pageTranslations } from '../lib/pageTranslations'; // Si applicable
    import type { CollectionEntry } from 'astro:content';


    // Simuler la présence d'un post pour l'exemple, cela viendrait des props
    const post: CollectionEntry<'blog'> | undefined = Astro.props.post; 

    const siteUrl = new URL(Astro.site || 'http://localhost:4321'); // Fallback pour dev
    const currentPathname = Astro.url.pathname;
    const currentLocale = Astro.currentLocale || Astro.config.i18n.defaultLocale;
    const allLocales = Astro.config.i18n.locales;
    const defaultLocale = Astro.config.i18n.defaultLocale;

    let hreflangLinks: { lang: string, href: string }[] = [];
    let xDefaultHref: string | null = null;

    if (post && post.collection === 'blog') { // Logique pour les articles de blog
      const translations = await getTranslatedArticles(post);
      // Ajouter la version actuelle
      hreflangLinks.push({ lang: currentLocale, href: new URL(currentPathname, siteUrl).href });
      translations.forEach(t => {
        hreflangLinks.push({ lang: t.lang, href: new URL(`/${t.lang}/blog/${t.slug}/`, siteUrl).href });
      });
    } else { // Logique pour les pages statiques/listings
      const canonicalCurrentPath = currentPathname.endsWith('/') ? currentPathname : `${currentPathname}/`;
      
      if (pageTranslations[canonicalCurrentPath]) {
        allLocales.forEach(loc => {
          let translatedPath = null;
          if (loc === currentLocale) {
            translatedPath = canonicalCurrentPath;
          } else if (pageTranslations[canonicalCurrentPath]?.[loc]) {
            translatedPath = pageTranslations[canonicalCurrentPath][loc];
          }
          
          if (translatedPath) {
            hreflangLinks.push({ lang: loc, href: new URL(translatedPath, siteUrl).href });
          }
        });
      } else { // Fallback si la page n'est pas dans le mappage (ex: 404 ou nouvelle page)
          // On pourrait ajouter seulement la version actuelle si on ne connait pas les autres
          hreflangLinks.push({ lang: currentLocale, href: new URL(currentPathname, siteUrl).href });
      }
    }
    
    // Déterminer le x-default
    const defaultLangLink = hreflangLinks.find(link => link.lang === defaultLocale);
    if (defaultLangLink) {
        xDefaultHref = defaultLangLink.href;
    } else if (post && post.collection === 'blog' && post.data.lang === defaultLocale) {
        // Cas où l'article est dans la langue par défaut mais pas encore dans hreflangLinks (si getTranslatedArticles l'exclut)
        xDefaultHref = new URL(currentPathname, siteUrl).href;
    } else if (!post && pageTranslations[currentPathname]?.[defaultLocale]) {
         xDefaultHref = new URL(pageTranslations[currentPathname][defaultLocale], siteUrl).href;
    } else if (!post && currentLocale === defaultLocale) {
         xDefaultHref = new URL(currentPathname, siteUrl).href;
    }


    // Éviter les doublons au cas où
    const uniqueHreflangLinks = [...new Map(hreflangLinks.map(item => [item.href, item])).values()];
    ---

    {/* Dans le <head> du BaseLayout.astro */}
    {uniqueHreflangLinks.map(link => (
      <link rel="alternate" hreflang={link.lang} href={link.href} />
    ))}
    {xDefaultHref && (
      <link rel="alternate" hreflang="x-default" href={xDefaultHref} />
    )}
    ```
- [ ] Tester sur différents types de pages (accueil, article avec traductions, article sans traductions, page "À Propos") en vérifiant le code source généré.
- [ ] Mettre à jour la documentation.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.
- **Manual/Browser Source Inspection:**
  - Pour chaque type de page (accueil, article, page statique) :
    - Charger la version française et vérifier les balises `hreflang` générées (doivent inclure `fr`, `en`, et `x-default`).
    - Charger la version anglaise et vérifier les balises `hreflang`.
    - S'assurer que les URLs sont absolues et correctes.
    - Utiliser un validateur `hreflang` en ligne si possible.
- _(Hint: Voir `docs/strategie-tests.md`, `docs/bilinguisme/gestion-contenu.md`, `docs/seo/strategie-seo.md`)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed. La logique pour les pages statiques et les articles peut être complexe à unifier parfaitement sans dupliquer certaines infos.}
- **Change Log:**
  - Initial Draft