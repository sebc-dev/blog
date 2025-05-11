# Blog Technique Bilingue - Gestion du Contenu Bilingue

Ce document détaille les directives et les bonnes pratiques pour la création, la gestion, la structuration et la publication de contenu bilingue (français et anglais) sur le "Blog Technique Bilingue". Il s'adresse aux rédacteurs de contenu, aux développeurs et aux agents IA impliqués dans le cycle de vie du contenu. L'objectif est d'assurer une expérience utilisateur fluide, une localisation de haute qualité et une optimisation SEO efficace pour les deux langues.

## 1. Structure des Fichiers de Contenu et Configuration des Collections

Une organisation claire du contenu est primordiale. Nous utilisons les collections de contenu d'Astro pour gérer les articles de blog en français et en anglais de manière structurée et typée.

### 1.1. Organisation des Répertoires

Conformément aux meilleures pratiques et pour une meilleure maintenabilité, les articles de blog sont organisés par langue au sein d'une collection unique nommée `blog`.

La structure adoptée est la suivante :

```plaintext
src/
└── content/
    └── blog/                   # Collection "blog"
    │   ├── en/                 # Contenu en anglais
    │   │   ├── an-article-slug.mdx
    │   │   └── another-article-slug.mdx
    │   └── fr/                 # Contenu en français
    │       ├── un-slug-darticle.mdx
    │       └── un-autre-slug-darticle.mdx
    └── config.ts               # Configuration des collections Astro
````

Cette approche s'aligne avec les fonctionnalités de routage i18n d'Astro et simplifie la gestion des fichiers. (Source : Rapport Astro Blog Bilingue, Section III.A)

### 1.2. Configuration de la Collection `blog`

Le schéma de notre collection `blog` est défini dans `src/content/config.ts` en utilisant Zod pour la validation des données du frontmatter. Cela garantit la cohérence et la sécurité des types pour chaque article.

TypeScript

```
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content', // Indique des fichiers Markdown ou MDX
  schema: z.object({
    title: z.string(), // Titre de l'article (localisé)
    description: z.string().optional(), // Description courte (localisée, pour SEO)
    pubDate: z.date(), // Date de publication originale (peut être z.coerce.date() pour parser des chaînes)
    updatedDate: z.date().optional(), // Date de dernière mise à jour (localisée)
    tags: z.array(z.string()).optional(), // Liste de tags (localisés)
    lang: z.enum(['en', 'fr']), // Langue de cet article spécifique
    translationId: z.string(), // Identifiant unique partagé entre toutes les traductions d'un même article.
                               // **Ce champ correspond à l'`articleCanonicalSlug` utilisé par le backend**
                               // pour regrouper les métriques d'un article indépendamment de sa langue.
                               // Il doit être stable et unique pour un ensemble de traductions.
                               // (Ex: "mon-super-article-tauri-2025")
    slug: z.string().optional(), // Slug personnalisé et localisé pour l'URL (ex: "les-iles-astro" en français).
                                 // Si non fourni, Astro génère un slug à partir du nom de fichier.
                                 // Ce slug est spécifique à la version linguistique de l'article.
    isDraft: z.boolean().default(false).optional(), // Pour marquer un article comme brouillon
    // Ajoutez ici d'autres champs spécifiques si nécessaire (ex: auteur, image de couverture)
  }),
});

export const collections = {
  'blog': blogCollection,
};
```

(Source : Rapport Astro Blog Bilingue, Section III.B, adapté et clarifié)

Cette configuration est cruciale pour la validation des métadonnées de chaque article et facilite leur interrogation programmatique, ainsi que la communication avec le backend.

## 2. Champs Frontmatter Essentiels et Conventions

Chaque article de blog, qu'il soit en français ou en anglais, doit contenir un bloc frontmatter au début du fichier MDX. Ce bloc définit les métadonnées cruciales pour la gestion, l'affichage et le référencement de l'article. Voici les champs définis dans notre schéma (`src/content/config.ts`) et les conventions associées :

- **`title`** (string, requis)
    
    - **Description :** Le titre principal de l'article.
    - **Convention :** Doit être localisé dans la langue de l'article. Par exemple, "Understanding Astro Islands" pour un article en anglais, et "Comprendre les Îles Astro" pour sa traduction française.
    - _(Source : Rapport Astro Blog Bilingue, Section III.C)_
- **`description`** (string, optionnel)
    
    - **Description :** Une courte description (1-2 phrases) du contenu de l'article. Utilisée pour les méta-descriptions SEO et les aperçus.
    - **Convention :** Doit être localisée. Si absente, un extrait pourrait être généré, mais il est préférable de la fournir pour un meilleur contrôle SEO.
    - _(Source : Rapport Astro Blog Bilingue, Section III.C)_
- **`pubDate`** (date, requis)
    
    - **Description :** La date de publication originale de l'article.
    - **Convention :** Peut être une chaîne de date (ex: `YYYY-MM-DD`) que Zod convertira (`z.coerce.date()`). Il est recommandé de synchroniser cette date entre les traductions pour représenter la date de publication initiale du _contenu conceptuel_. Cependant, si les traductions sont publiées à des moments très différents et que cela a une importance éditoriale, elles peuvent être distinctes. Pour le MVP, nous visons la synchronisation.
    - _(Source : Rapport Astro Blog Bilingue, Section III.C, adapté)_
- **`updatedDate`** (date, optionnel)
    
    - **Description :** La date de la dernière mise à jour significative de _cette version linguistique_ de l'article.
    - **Convention :** À utiliser si l'article est modifié après sa publication initiale. Permet d'indiquer aux lecteurs et aux moteurs de recherche que le contenu est à jour.
    - _(Source : Rapport Astro Blog Bilingue, Section III.C)_
- **`tags`** (array de strings, optionnel)
    
    - **Description :** Une liste de mots-clés ou d'étiquettes décrivant les sujets principaux de l'article.
    - **Convention :** Les tags doivent être localisés si leur signification change ou s'ils sont destinés à être affichés et filtrés dans une langue spécifique. (Ex: `["performance", "islands"]` vs `["performance", "îles"]`).
    - _(Source : Rapport Astro Blog Bilingue, Section III.C)_
- **`lang`** (enum: `'en'` | `'fr'`, requis)
    
    - **Description :** La langue du contenu de ce fichier MDX spécifique.
    - **Convention :** Doit être soit `en` pour l'anglais, soit `fr` pour le français. Ce champ est crucial pour le filtrage, le routage et l'affichage conditionnel.
    - _(Source : Rapport Astro Blog Bilingue, Section III.C)_
- **`translationId`** (string, requis)
    
    - **Description :** Un identifiant unique et stable partagé entre toutes les traductions d'un même article conceptuel.
    - **Convention :**
        - Cet identifiant **est l'`articleCanonicalSlug`** utilisé par le backend pour les métriques (partages, feedback).
        - Il doit être unique pour un ensemble de traductions et ne pas changer une fois défini.
        - Utiliser un format lisible par l'humain, en minuscules, avec des tirets pour séparer les mots (kebab-case).
        - Exemple : `understanding-astro-islands-2025` (inclure l'année peut aider à l'unicité si le sujet est revisité).
        - Toutes les versions linguistiques d'un même article doivent avoir **exactement le même `translationId`**.
    - _(Source : Rapport Astro Blog Bilingue, Section III.C, et clarification précédente)_
- **`slug`** (string, optionnel)
    
    - **Description :** Le segment d'URL spécifiques à la langue pour cet article.
    - **Convention :**
        - S'il est fourni, il sera utilisé pour construire l'URL finale (ex: `/fr/{slug}`).
        - Doit être en minuscules, avec des tirets pour séparer les mots (kebab-case).
        - Doit être unique au sein de sa langue.
        - Fortement recommandé pour avoir des URLs sémantiques et localisées (ex: `les-iles-astro-en-profondeur` pour la version française, `astro-islands-deep-dive` pour l'anglaise).
        - Si ce champ n'est pas fourni, Astro générera automatiquement un slug à partir du nom de fichier. Il est préférable de le définir explicitement pour un meilleur contrôle.
    - _(Source : Rapport Astro Blog Bilingue, Section III.C)_
- **`isDraft`** (boolean, optionnel, défaut: `false`)
    
    - **Description :** Indique si l'article est un brouillon et ne doit pas être publié.
    - **Convention :** Mettre à `true` pour les articles en cours de rédaction ou de révision. Les articles avec `isDraft: true` seront exclus des listings publics et des sitemaps.
    - _(Source : Rapport Astro Blog Bilingue, Section III.B)_

### Exemple de Frontmatter Combiné

**Article en anglais (`src/content/blog/en/astro-islands-deep-dive.mdx`):**

YAML

```
---
title: "Astro Islands: A Deep Dive"
description: "Understanding the power of Astro Islands for performance."
pubDate: 2025-10-26
updatedDate: 2025-10-27
tags: ["astro", "performance", "islands"]
lang: "en"
translationId: "astro-islands-explained-2025" # articleCanonicalSlug pour le backend
slug: "astro-islands-deep-dive" # Slug localisé pour l'URL /en/astro-islands-deep-dive
isDraft: false
---

Le contenu de l'article commence ici...
```

**Article en français (`src/content/blog/fr/les-iles-astro-en-profondeur.mdx`):**

YAML

```
---
title: "Les Îles Astro : Une Plongée en Profondeur"
description: "Comprendre la puissance des Îles Astro pour la performance."
pubDate: 2025-10-26 # Date de publication initiale du concept
updatedDate: 2025-10-28 # Date de mise à jour spécifique à la version FR
tags: ["astro", "performance", "îles"]
lang: "fr"
translationId: "astro-islands-explained-2025" # MÊME translationId que la version EN
slug: "les-iles-astro-en-profondeur" # Slug localisé pour l'URL /fr/les-iles-astro-en-profondeur
isDraft: false
---

Le contenu de l'article commence ici...
```

Cette structuration rigoureuse du frontmatter est essentielle pour toutes les fonctionnalités multilingues, SEO et la liaison avec le backend.

## 3. Processus de Création et de Traduction de Contenu

La qualité et la cohérence du contenu sont essentielles pour un blog technique bilingue. Voici les directives pour la création et la traduction des articles.

### 3.1. Création d'un Nouvel Article (Langue Source)

1. **Choix de la Langue Source :** Un article peut être initialement rédigé en français ou en anglais, selon la préférence ou l'expertise de l'auteur sur le sujet.
2. **Création du Fichier MDX :**
    - Créez un nouveau fichier `.mdx` dans le répertoire de la langue source (ex: `src/content/blog/en/nouveau-sujet.mdx`).
    - Remplissez le frontmatter en respectant scrupuleusement les champs définis à la section 2 :
        - `title`, `description` (localisés dans la langue source).
        - `pubDate` (date de la première publication prévue).
        - `tags` (localisés si nécessaire).
        - `lang` (code de la langue source, ex: `en`).
        - `translationId` : **Définissez un `translationId` unique et descriptif** pour cet article (ex: `guide-astro-ssr-2025`). Cet ID sera partagé avec toutes ses traductions.
        - `slug` : Définissez un slug localisé pour l'URL de l'article dans la langue source (ex: `astro-ssr-guide`).
        - `isDraft: true` pendant la rédaction.
3. **Rédaction du Contenu :** Rédigez le contenu de l'article en utilisant la syntaxe MDX. Intégrez des exemples de code, des images et des composants interactifs au besoin, en gardant à l'esprit qu'ils devront également être compréhensibles ou adaptables pour la version traduite.
4. **Revue et Validation (Langue Source) :** Faites relire l'article par un pair pour vérifier la clarté technique, la grammaire et le style.

### 3.2. Processus de Traduction

La **traduction manuelle et de haute qualité, assistée par des outils d'IA si souhaité, mais toujours avec une validation humaine rigoureuse,** est privilégiée pour garantir la précision technique et les nuances culturelles. (Source : Rapport Astro Blog Bilingue, Section IV.A, adapté)

1. **Préparation pour la Traduction :**
    - Une fois l'article source finalisé (ou proche de la finalisation), il est prêt pour la traduction.
2. **Création du Fichier MDX Traduit :**
    - Créez un nouveau fichier `.mdx` dans le répertoire de la langue cible (ex: `src/content/blog/fr/guide-astro-ssr.mdx`).
    - Copiez le frontmatter de l'article source et adaptez-le :
        - `title`, `description` : Traduisez-les dans la langue cible (peut être assisté par IA, puis révisé).
        - `pubDate` : Conservez la même `pubDate` que l'article source (pour le MVP).
        - `updatedDate` : Peut être défini à la date de la traduction ou de la mise à jour de la traduction.
        - `tags` : Traduisez ou adaptez les tags pour la langue cible.
        - `lang` : Mettez le code de la langue cible (ex: `fr`).
        - `translationId` : **Utilisez exactement le même `translationId` que l'article source.** C'est ce qui lie les deux versions.
        - `slug` : Définissez un slug localisé pour l'URL de l'article dans la langue cible (ex: `guide-astro-ssr`).
        - `isDraft: true` pendant la traduction et la revue.
3. **Traduction du Contenu (Workflow Suggéré avec IA) :**
    - **Étape 1 (Optionnelle - IA) :** Utilisez un outil d'IA comme **Claude** pour générer une première version de la traduction du corps de l'article. Fournissez à l'IA le contenu source complet et demandez une traduction vers la langue cible, en précisant si possible le contexte technique.
    - **Étape 2 (Cruciale - Humaine) :** **Relisez et corrigez intégralement la traduction fournie par l'IA.** Portez une attention particulière :
        - Au jargon technique et à sa traduction correcte et cohérente (s'appuyer sur le glossaire).
        - Aux exemples de code (les commentaires dans le code peuvent aussi nécessiter une traduction ou une adaptation).
        - Au ton et au style pour qu'ils correspondent à l'audience cible et à la ligne éditoriale du blog.
        - Aux références culturelles et à leur adaptation si nécessaire.
    - Adaptez les images avec du texte incrusté (elles doivent être localisées ou conçues pour être linguistiquement neutres).
4. **Revue et Validation (Langue Cible) :** Faites relire la traduction (corrigée humainement) par une autre personne maîtrisant la langue cible et, idéalement, ayant une compréhension du sujet technique. Cette étape est d'autant plus importante si une IA a été utilisée pour la première passe.
5. **Publication :** Une fois les deux versions (ou plus) validées, passez `isDraft: false` dans le frontmatter des fichiers concernés.

### 3.3. Maintien de la Cohérence

- **Glossaires et Guides de Style :** Il est recommandé de maintenir un glossaire bilingue des termes techniques fréquemment utilisés et un guide de style pour assurer la cohérence terminologique et tonale entre les versions françaises et anglaises. Ce glossaire sera également utile pour guider l'IA lors de la traduction. (Source : Rapport Astro Blog Bilingue, Section IV.A)
- **Mises à Jour de Contenu :** Si un article source est mis à jour de manière significative, la version traduite doit également être mise à jour pour refléter les changements. Le champ `updatedDate` de chaque version linguistique doit être actualisé en conséquence. Le même processus de traduction assistée par IA puis de validation humaine s'applique.

### 3.4. Outils d'IA pour la Traduction (Assistance)

- L'utilisation d'outils d'IA avancés comme **Claude** (ou d'autres modèles similaires tels que DeepL, Google Translate) est encouragée pour **assister** dans le processus de traduction et fournir une première ébauche. Cela peut considérablement accélérer le workflow.
- Cependant, il est **impératif et non négociable** qu'une **révision, une correction et une validation humaines approfondies** soient effectuées sur toute traduction générée par une IA. Le contenu technique exige une grande précision, une terminologie correcte, et une adaptation des nuances que seule une expertise humaine peut garantir pour maintenir la haute qualité visée par le blog.
- Des outils CMS comme "Front Matter CMS" peuvent s'intégrer à des services de traduction automatique, mais la supervision humaine reste la clé. (Source : Rapport Astro Blog Bilingue, Section IV.A)

## 4. Liaison des Articles Traduits et Sélecteur de Langue

Permettre aux utilisateurs de naviguer facilement entre les versions linguistiques d'un même article est une fonctionnalité clé.

### 4.1. Mécanisme de Liaison via `translationId`

Comme défini dans le frontmatter (Section 2), le champ translationId est la pierre angulaire pour lier les articles traduits.

Sur la page d'un article donné (générée, par exemple, par src/pages/[lang]/blog/[slug].astro), nous pouvons accéder au translationId de l'article actuel.

Pour trouver les autres versions linguistiques de cet article :

1. On récupère l'ensemble de la collection `blog`.
2. On filtre cette collection pour ne garder que les articles ayant le **même `translationId`** et qui ne sont pas des brouillons (`isDraft: false`).

Voici un exemple conceptuel de fonction pour récupérer les articles traduits (à placer dans un fichier utilitaire ou directement dans le composant de layout/page concerné) :

TypeScript

```
// Exemple de fonction utilitaire (ex: src/lib/i18nUtils.ts ou similaire)
import { getCollection, type CollectionEntry } from 'astro:content';

export async function getTranslatedArticles(currentPost: CollectionEntry<'blog'>): Promise<CollectionEntry<'blog'>[]> {
  const currentTranslationId = currentPost.data.translationId;
  if (!currentTranslationId) {
    return [currentPost]; // Retourne seulement le post actuel s'il n'a pas de translationId
  }

  const allPostsInCollection = await getCollection('blog', entry =>
    !entry.data.isDraft // Exclure les brouillons
  );

  const translatedArticles = allPostsInCollection.filter(
    entry => entry.data.translationId === currentTranslationId
  );

  return translatedArticles.length > 0 ? translatedArticles : [currentPost];
}
```

(Source : Inspiré de la Section IV.C du Rapport Astro Blog Bilingue)

### 4.2. Génération des URLs pour les Traductions

Une fois que nous avons la liste des CollectionEntry correspondant aux différentes traductions d'un article, nous devons générer les URLs correctes pour chacune.

L'URL est construite en utilisant la langue (entry.data.lang) et le slug localisé (entry.data.slug ou entry.slug si le premier n'est pas défini) de chaque traduction.

La fonction `getRelativeLocaleUrl()` fournie par `astro:i18n` est l'outil privilégié pour cela, car elle prend en compte la configuration de routage i18n du projet (préfixe de langue, etc.).

TypeScript

```
// Dans un composant Astro, après avoir récupéré `translatedArticles`
// import { getRelativeLocaleUrl } from 'astro:i18n'; // S'assurer que i18n est configuré

// translatedArticles.map(t => {
//   const articleSlugForUrl = t.data.slug || t.slug.split('/').pop(); // Utilise le slug du frontmatter ou déduit du nom de fichier
//   const targetUrl = getRelativeLocaleUrl(t.data.lang, `blog/${articleSlugForUrl}`);
//   // targetUrl sera par ex. /fr/blog/mon-slug ou /en/blog/my-slug
// });
```

(Source : Section IV.C du Rapport Astro Blog Bilingue)

### 4.3. Implémentation du Sélecteur de Langue pour les Articles

Un composant Astro dédié (`ArticleLanguageSwitcher.astro` par exemple) peut être créé pour afficher les liens vers les versions traduites d'un article. Ce composant prendra en entrée la langue actuelle et la liste des `CollectionEntry` traduites.

Exemple de composant ArticleLanguageSwitcher.astro:

(Basé sur l'exemple de la Section IV.C de votre rapport)

Extrait de code

```
---
// src/components/ArticleLanguageSwitcher.astro
import type { CollectionEntry } from 'astro:content';
import { getRelativeLocaleUrl } from 'astro:i18n';
import { languages } // Assurez-vous que `languages` est défini dans votre fichier ui.ts
       // (ex: export const languages = { en: 'English', fr: 'Français' };)
       from '../lib/i18n'; // Adaptez le chemin vers votre fichier d'index i18n

interface Props {
  currentLang: 'en' | 'fr';
  translations: CollectionEntry<'blog'>[]; // La liste des articles traduits (incluant l'actuel)
}

const { currentLang, translations } = Astro.props;

// Filtrer pour ne garder qu'une seule entrée par langue disponible (au cas où il y aurait des doublons inattendus)
const uniqueTranslationsByLang = translations.reduce((acc, current) => {
  if (!acc.find(item => item.data.lang === current.data.lang)) {
    acc.push(current);
  }
  return acc;
}, [] as CollectionEntry<'blog'>[]);
---

{uniqueTranslationsByLang && uniqueTranslationsByLang.length > 1 && (
  <nav aria-label="Switch article language" class="language-switcher">
    <p>Lire en :</p>
    <ul>
      {uniqueTranslationsByLang.map(t => {
        const articleSlugForUrl = t.data.slug || t.slug.split('/').pop();
        if (!articleSlugForUrl) return null; // Ne pas rendre de lien si le slug est indéterminé

        const targetUrl = getRelativeLocaleUrl(t.data.lang, `blog/${articleSlugForUrl}`);
        const isCurrent = t.data.lang === currentLang;

        return (
          <li>
            <a
              href={targetUrl}
              hreflang={t.data.lang}
              aria-current={isCurrent ? 'page' : undefined}
              class:list={{ active: isCurrent }}
            >
              {languages[t.data.lang] || t.data.lang.toUpperCase()}
            </a>
          </li>
        );
      })}
    </ul>
  </nav>
)}

<style>
  .language-switcher ul {
    list-style-type: none;
    padding: 0;
    display: flex;
    gap: 0.5em;
  }
  .language-switcher .active {
    font-weight: bold;
    text-decoration: none; /* ou autre style pour indiquer la page active */
    /* pointer-events: none; /* Pour désactiver le clic sur la langue actuelle */
  }
</style>
```

Ce composant doit être placé dans le layout utilisé pour afficher les articles de blog. Il recevra l'article actuel (`Astro.props.entry` si vous utilisez `getStaticPaths` avec les collections) et pourra ensuite appeler `getTranslatedArticles` ou recevoir directement la liste des traductions.

### 4.4. Sélecteur de Langue Global

Pour les pages qui ne sont pas des articles de blog (ex: À propos, page d'accueil du blog), un sélecteur de langue global est nécessaire.

- **Positionnement :** Typiquement dans l'en-tête (`header`) ou le pied de page (`footer`) du site, présent sur toutes les pages.
- **Logique :**
    - Il doit lister les langues disponibles (ex: "Français", "English").
    - Chaque lien doit pointer vers la version correspondante de la page actuelle dans l'autre langue.
    - La fonction `getRelativeLocaleUrl(lang, Astro.url.pathname, true)` peut être utile ici, où le troisième argument `true` (ou une logique personnalisée) aiderait à reconstruire le chemin en changeant uniquement le préfixe de langue.
    - Si les chemins sont traduits (ex: `/fr/a-propos` vs `/en/about`), une correspondance des routes doit être maintenue (par exemple, dans `src/lib/i18n/index.ts` ou un fichier dédié).

TypeScript

```
// Exemple de structure pour les routes traduites dans src/lib/i18n/routes.ts
// export const translatedRoutes = {
//   en: {
//     'about': '/en/about',
//     'blogIndex': '/en/blog',
//   },
//   fr: {
//     'about': '/fr/a-propos',
//     'blogIndex': '/fr/blogue', // si le slug de la page de listing blog est aussi traduit
//   }
// }

// Puis une fonction pour obtenir la route traduite
// export function getTranslatedPath(targetLang: string, routeKey: keyof typeof translatedRoutes['en']) {
//   // Logique pour retourner la route traduite...
// }
```

L'implémentation exacte dépendra de la complexité du routage des pages statiques en dehors des collections. La documentation Astro sur l'i18n et la recette "i18n" fournissent des bases solides pour cela.

## 5. Traduction des Chaînes de l'Interface Utilisateur (UI)

Au-delà du contenu des articles, les éléments de l'interface utilisateur (UI) tels que les textes de navigation, les libellés de boutons, les messages d'aide, les pieds de page, etc., doivent également être traduits.

### 5.1. Approche Recommandée pour le MVP : Fichiers de Traduction par Langue

Pour le MVP, nous adoptons une approche simple et claire en séparant les traductions de l'UI dans des fichiers TypeScript distincts pour chaque langue. Cette méthode est légère, ne nécessite pas de dépendances externes complexes et offre une bonne sécurité de types avec TypeScript.

(Inspiré par : Rapport Astro Blog Bilingue, Section IV.B, et préférence pour des fichiers séparés)

### 5.2. Structure des Fichiers de Traduction UI

Nous allons créer un répertoire dédié pour les traductions de l'UI, par exemple `src/lib/i18n/`, et y placer un fichier par langue.

**Exemple de `src/lib/i18n/en.ts` (pour l'anglais) :**

TypeScript

```
// src/lib/i18n/en.ts
export const translationsEn = {
  // Navigation
  'nav.home': 'Home',
  'nav.blog': 'Blog',
  'nav.about': 'About',
  // Pied de page
  'footer.rights': 'All rights reserved.',
  'footer.madeWith': 'Made with',
  // Articles
  'article.readIn': 'Read in:',
  'article.tags': 'Tags:',
  'article.share': 'Share this article:',
  'article.usefulFeedback': 'Was this article useful?',
  'article.usefulYes': 'Yes',
  'article.usefulNo': 'No',
  'article.feedbackThanks': 'Thanks for your feedback!',
  // Sélecteur de langue global
  'globalNav.switchLanguageTo': 'Switch to Français',
  // Autres...
  'search.placeholder': 'Search articles...',
  'pageNotFound.title': 'Page Not Found',
  'pageNotFound.message': 'Sorry, we couldn’t find the page you’re looking for.',
} as const;

export type UITranslationKey = keyof typeof translationsEn;
```

**Exemple de `src/lib/i18n/fr.ts` (pour le français) :**

TypeScript

```
// src/lib/i18n/fr.ts
import type { UITranslationKey } from './en'; // Importer le type depuis le fichier de la langue par défaut

export const translationsFr: Record<UITranslationKey, string> = {
  // Navigation
  'nav.home': 'Accueil',
  'nav.blog': 'Blog',
  'nav.about': 'À Propos',
  // Pied de page
  'footer.rights': 'Tous droits réservés.',
  'footer.madeWith': 'Fait avec',
  // Articles
  'article.readIn': 'Lire en :',
  'article.tags': 'Étiquettes :',
  'article.share': 'Partager cet article :',
  'article.usefulFeedback': 'Cet article vous a-t-il été utile ?',
  'article.usefulYes': 'Oui',
  'article.usefulNo': 'Non',
  'article.feedbackThanks': 'Merci pour votre retour !',
  // Sélecteur de langue global
  'globalNav.switchLanguageTo': 'Passer en English',
  // Autres...
  'search.placeholder': 'Rechercher des articles...',
  'pageNotFound.title': 'Page Non Trouvée',
  'pageNotFound.message': 'Désolé, nous n’avons pas pu trouver la page que vous recherchez.',
};
```

**Fichier d'index `src/lib/i18n/index.ts` pour regrouper les configurations :**

TypeScript

```
// src/lib/i18n/index.ts
import { translationsEn, type UITranslationKey as DefaultUITranslationKey } from './en';
import { translationsFr } from './fr';

export const languages = {
  en: 'English',
  fr: 'Français',
} as const;

export const defaultLang = 'en'; // Langue par défaut du site

export type SupportedLang = keyof typeof languages;
export type UITranslationKey = DefaultUITranslationKey; // Utiliser les clés de la langue par défaut comme référence

export const uiTranslations: Record<SupportedLang, Record<UITranslationKey, string>> = {
  en: translationsEn,
  fr: translationsFr,
};
```

### 5.3. Fonctions Utilitaires pour la Traduction UI

Les fonctions utilitaires s'adapteront pour utiliser cette nouvelle structure.

**Exemple de `src/lib/i18n/utils.ts` (mis à jour) :**

TypeScript

```
// src/lib/i18n/utils.ts
import { uiTranslations, defaultLang, type SupportedLang, type UITranslationKey } from './index';
import { getLocale } from 'astro:i18n';

export function getLangFromUrl(url: URL): SupportedLang {
  const locale = getLocale(url.pathname);
  if (locale && locale in uiTranslations) {
    return locale as SupportedLang;
  }
  return defaultLang;
}

export function useTranslations(lang: SupportedLang | undefined) {
  const effectiveLang = lang && lang in uiTranslations ? lang : defaultLang;
  const translationsForLang = uiTranslations[effectiveLang];
  const defaultTranslations = uiTranslations[defaultLang]; // Fallback

  return function t(key: UITranslationKey, params?: Record<string, string | number>): string {
    let translation = translationsForLang[key] ?? defaultTranslations[key]; // Utilise ?? pour le fallback

    if (translation === undefined) {
      console.warn(`Translation key "${String(key)}" not found for lang "${effectiveLang}" or defaultLang "${defaultLang}".`);
      return String(key);
    }

    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translation = translation.replace(new RegExp(`{${paramKey}}`, 'g'), String(value));
      });
    }
    return translation;
  }
}
```

### 5.4. Utilisation dans les Composants et Pages Astro

L'utilisation dans les composants reste similaire :

Extrait de code

```
---
import { getRelativeLocaleUrl, Astro } from 'astro:i18n';
import { useTranslations } from '../../lib/i18n/utils';
import { defaultLang, uiTranslations, type SupportedLang } from '../../lib/i18n';

const currentAstroLocale = Astro.currentLocale;
const lang = (currentAstroLocale && currentAstroLocale in uiTranslations ? currentAstroLocale : defaultLang) as SupportedLang;
const t = useTranslations(lang);
---

<nav>
  <a href={getRelativeLocaleUrl(lang, '/')}>{t('nav.home')}</a>
  <a href={getRelativeLocaleUrl(lang, '/blog')}>{t('nav.blog')}</a>
</nav>
```

### 5.5. Traduction des Composants MDX

Si des composants interactifs dans MDX nécessitent du texte traduit, passez les chaînes traduites comme `props` ou implémentez une logique i18n interne si nécessaire.

### 5.6. Évolution Future

Cette approche est robuste pour le MVP. Si les besoins augmentent (pluralisation complexe), des bibliothèques i18n dédiées pourront être évaluées.

(Source : Rapport Astro Blog Bilingue, Section IV.B [46-52])

## 6. Expérience Utilisateur (UX) pour la Navigation Multilingue

Une expérience utilisateur soignée pour la navigation entre les langues est cruciale pour l'engagement et la satisfaction des visiteurs.

### 6.1. Définition Dynamique de l'Attribut `lang` sur la Balise `<html>`

L'attribut `lang` sur la balise `<html>` doit être défini dynamiquement pour chaque page afin d'indiquer correctement sa langue principale.

**Implémentation (`src/layouts/BaseLayout.astro`):**

Extrait de code

```
---
import { defaultLang } from '../lib/i18n'; // Assurez-vous que defaultLang est exporté de votre index i18n
const currentLocale = Astro.currentLocale;
---
<html lang={currentLocale || defaultLang}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
  </head>
  <body>
    <slot />
  </body>
</html>
```

(Source : Rapport Astro Blog Bilingue, Section V.B, adapté [80-81])

### 6.2. Détection et Persistance de la Préférence Linguistique

**Stratégie :**

1. **Visite Initiale - Détection côté Serveur (Middleware `src/middleware.ts`) :**
    - Vérifie un cookie de préférence (`preferred_language_v2`).
    - Sinon, analyse l'en-tête `Accept-Language`.
    - Redirige vers la locale appropriée (ou `defaultLang`) si nécessaire, en respectant `prefixDefaultLocale`. (Source : Rapport Astro Blog Bilingue, Sections V.C [83-86, 89])
2. **Choix Manuel de l'Utilisateur :**
    - Le choix via sélecteur de langue stocke la préférence dans `localStorage` (`preferred_language_v2_user_choice`) et met à jour le cookie. (Source : Rapport Astro Blog Bilingue, Sections V.C [84, 91, 95-98])

**Exemple conceptuel de `src/middleware.ts`:**

TypeScript

```
// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';
import { getLocale, getRelativeLocaleUrl, locales, defaultLocale } from 'astro:i18n';

const PREFERRED_LANG_COOKIE_KEY = 'preferred_language_v2';

export const onRequest = defineMiddleware(async (context, next) => {
  const currentPathname = context.url.pathname;
  const currentLocaleFromPath = getLocale(currentPathname);
  const preferredLangCookie = context.cookies.get(PREFERRED_LANG_COOKIE_KEY)?.value;
  let targetLang: string | undefined = undefined;

  if (preferredLangCookie && locales.includes(preferredLangCookie)) {
    targetLang = preferredLangCookie;
  } else {
    const acceptLanguageHeader = context.request.headers.get('accept-language');
    if (acceptLanguageHeader) {
      const browserLangs = acceptLanguageHeader.split(',').map(lang => lang.split(';')[0].trim().toLowerCase().split('-')[0]);
      targetLang = browserLangs.find(lang => locales.includes(lang));
    }
  }
  if (!targetLang) {
    targetLang = defaultLocale;
  }

  const i18nConfig = context.site?.i18n;
  const prefixDefault = i18nConfig?.routing?.prefixDefaultLocale ?? false;

  // Condition pour rediriger :
  // 1. La langue cible est différente de la langue actuelle de l'URL OU
  // 2. L'URL n'a pas de préfixe de langue ET la langue cible n'est pas la langue par défaut (ou si on doit préfixer la langue par défaut)
  const needsRedirect = targetLang !== currentLocaleFromPath && 
                        (currentLocaleFromPath !== targetLang || (prefixDefault && currentLocaleFromPath !== targetLang));
  
  if (needsRedirect) {
    // Construction du nouveau chemin sans le préfixe de langue actuel (s'il existe)
    let basePath = currentPathname;
    if (currentLocaleFromPath) {
      const prefixToRemove = `/${currentLocaleFromPath}`;
      if (basePath.startsWith(prefixToRemove)) {
        basePath = basePath.substring(prefixToRemove.length) || '/';
      }
    }
    const newPath = getRelativeLocaleUrl(targetLang, basePath);

    if (newPath && newPath !== currentPathname) {
      return context.redirect(newPath, 307); // 307 Temporary Redirect
    }
  }
  return next();
});
```

**Script Côté Client pour `localStorage` et cookie (dans `BaseLayout.astro`):**

HTML

```
<script is:inline>
  const PREFERRED_LANG_COOKIE_KEY = 'preferred_language_v2';
  const PREFERRED_LANG_LOCALSTORAGE_KEY = 'preferred_language_v2_user_choice';

  function setLanguagePreference(lang) {
    try {
      localStorage.setItem(PREFERRED_LANG_LOCALSTORAGE_KEY, lang);
      const d = new Date();
      d.setTime(d.getTime() + (365*24*60*60*1000));
      document.cookie = PREFERRED_LANG_COOKIE_KEY + "=" + lang + ";expires="+ d.toUTCString() + ";path=/;SameSite=Lax";
    } catch (e) { console.warn('Could not save language preference:', e); }
  }

  // Logique pour attacher aux sélecteurs de langue:
  // document.addEventListener('DOMContentLoaded', () => {
  //   document.querySelectorAll('a[data-lang-switcher]').forEach(link => { // Ajoutez data-lang-switcher à vos liens de sélecteur
  //     link.addEventListener('click', function() {
  //       const selectedLang = this.getAttribute('hreflang');
  //       if (selectedLang) setLanguagePreference(selectedLang);
  //     });
  //   });
  // });
</script>
```

(Source : Adapté des concepts des Sections V.C [92-103] du Rapport Astro Blog Bilingue)

### 6.3. Maintien du Contexte lors du Changement de Langue

- Pour les articles, le sélecteur doit lier à la traduction directe via `translationId`.
- Pour les pages générales, le sélecteur doit mapper vers la route équivalente dans l'autre langue.

## 7. Optimisation pour les Moteurs de Recherche (SEO International)

Un SEO international efficace est indispensable.

### 7.1. Structure d'URL en Sous-Répertoires

Nous utilisons /fr/... et /en/.... Il est fortement recommandé de configurer routing: { prefixDefaultLocale: true } dans astro.config.mjs pour que toutes les langues, y compris la langue par défaut, aient un préfixe (ex: /en/).

(Source : Rapport Astro Blog Bilingue, Section VI.A [107-109])

### 7.2. Implémentation des Balises `hreflang`

Crucial pour indiquer les versions linguistiques. Les URLs doivent être absolues. Inclure des liens auto-référencés, bidirectionnels, et une balise x-default (pointant vers la version anglaise par défaut).

(Source : Rapport Astro Blog Bilingue, Section VI.B [113-118])

**Implémentation (conceptuelle, dans le layout) :**

Extrait de code

```
---
// Dans un layout (ex: BaseLayout.astro ou ArticleLayout.astro)
// Logique pour récupérer allTranslatedVersions (voir section 4.1)
// const siteUrl = Astro.site;
// const xDefaultUrl = ...; // Logique pour déterminer l'URL x-default
---
<head>
  {/* ... */}
  {/* {siteUrl && allTranslatedVersions.map(translatedPost => <link rel="alternate" hreflang={translatedPost.data.lang} href={new URL(...).href} />)} */}
  {/* {xDefaultUrl && <link rel="alternate" hreflang="x-default" href={xDefaultUrl.href} />} */}
</head>
```

(Source : Rapport Astro Blog Bilingue, Section VI.B [119-127])

### 7.3. Balises Canoniques (`rel="canonical"`)

Chaque page linguistique doit avoir une balise canonique pointant vers elle-même.

(Source : Rapport Astro Blog Bilingue, Section VI.C [128-132])

**Implémentation (dans `BaseLayout.astro`) :**

Extrait de code

```
---
// const siteUrl = Astro.site;
// const canonicalURL = siteUrl ? new URL(Astro.url.pathname, siteUrl) : null;
---
<head>
  {/* {canonicalURL ? <link rel="canonical" href={canonicalURL.href} /> : <link rel="canonical" href={Astro.url.pathname} />} */}
</head>
```

(Source : Rapport Astro Blog Bilingue, Section VI.C [133])

### 7.4. Sitemap XML Multilingue

Utiliser @astrojs/sitemap avec la configuration i18n d'Astro.

(Source : Rapport Astro Blog Bilingue, Section VI.D [134])

**Configuration (`astro.config.mjs`) :**

JavaScript

```
// astro.config.mjs
// import { defineConfig } from 'astro/config';
// import sitemap from '@astrojs/sitemap';

// export default defineConfig({
//   site: '[https://votre-domaine.com](https://votre-domaine.com)',
//   i18n: {
//     defaultLocale: 'en',
//     locales: ['en', 'fr'],
//     routing: { prefixDefaultLocale: true }
//   },
//   integrations: [sitemap()],
// });
```

(Source : Rapport Astro Blog Bilingue, Section VI.D [135-137])

### 7.5. Données Structurées (Schema.org)

Utiliser JSON-LD avec la propriété inLanguage pour chaque page.

(Source : Rapport Astro Blog Bilingue, Section VI.E [139-140])

**Exemple (pour un composant `JsonLDArticle.astro`) :**

Extrait de code

```
---
// import type { CollectionEntry } from 'astro:content';
// interface Props { post: CollectionEntry<'blog'>; /* ... */ }
// const { post, siteUrl /* ... */ } = Astro.props;
// const schema = {
//   "@context": "[https://schema.org](https://schema.org)", "@type": "BlogPosting",
//   // ... autres propriétés ...
//   "inLanguage": post.data.lang,
// };
---
{/* <script type="application/ld+json" set:html={JSON.stringify(schema)} /> */}
```

(Source : Rapport Astro Blog Bilingue, Section VI.E [143-146])

### 7.6. Vérification et Outils

Utiliser Google Search Console et des validateurs en ligne pour `hreflang` et Schema.org.

## 8. Conclusion et Recommandations Clés

La mise en place d'une gestion de contenu bilingue efficace pour le "Blog Technique Bilingue" repose sur une structuration rigoureuse, des processus de traduction de qualité, une expérience utilisateur intuitive et une stratégie SEO internationale solide. En suivant les directives de ce document, basées sur les capacités d'Astro et les meilleures pratiques du secteur, nous visons à créer un site performant, facile à maintenir et bien positionné pour atteindre une audience globale.

**Récapitulatif des Piliers :**

1. **Structure de Contenu Claire :** Utilisation des collections Astro, organisation par langue, et schéma de frontmatter précis avec `lang` et `translationId` (qui sert d'`articleCanonicalSlug` pour le backend).
2. **Processus de Traduction Maîtrisé :** Priorité à la qualité via une traduction humaine, potentiellement assistée par des outils IA comme Claude, mais toujours avec une validation rigoureuse. Maintien de glossaires.
3. **Liaison et Navigation Intuitives :** Sélecteurs de langue clairs pour les articles (via `translationId`) et pour la navigation globale, supportés par des URLs localisées.
4. **Expérience Utilisateur Cohérente :** Définition de l'attribut `lang` sur `<html>`, détection et persistance des préférences linguistiques.
5. **Traduction des Chaînes UI :** Approche simple et typée avec des fichiers de traduction par langue pour le MVP.
6. **SEO International Optimisé :** Structure d'URL en sous-répertoires avec préfixe pour toutes les langues, implémentation méticuleuse des balises `hreflang` et `canonical`, sitemap XML multilingue, et utilisation de données structurées Schema.org avec `inLanguage`.

La collaboration entre les rédacteurs, traducteurs et développeurs, guidée par ces principes, sera la clé du succès du blog bilingue.

## 9. Change Log

|   |   |   |   |
|---|---|---|---|
|**Date**|**Version**|**Description**|**Auteur**|
|2025-05-11|0.1|Création initiale du document avec sections sur la structure, frontmatter, processus de traduction, liaison, traduction UI, UX navigation et SEO international.|3 - Architecte (IA) & Utilisateur|
|2025-05-11|0.2|Clarification de l'utilisation de `translationId` comme `articleCanonicalSlug` pour le backend. Intégration de Claude dans le workflow de traduction. Précision sur `prefixDefaultLocale: true`. Séparation des fichiers de traduction UI.|3 - Architecte (IA) & Utilisateur|
