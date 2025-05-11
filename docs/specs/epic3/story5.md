# Story 3.5: Affichage des images et diagrammes

**Status:** Draft

## Goal & Context

**User Story:** En tant qu'Utilisateur, je veux voir les images et diagrammes intégrés de manière pertinente, avec des légendes et des alternatives textuelles, afin de mieux comprendre les concepts techniques illustrés.

**Context:** Les images et diagrammes sont essentiels pour illustrer des concepts techniques. Cette story s'assure qu'ils sont bien intégrés, accessibles et optimisés. Elle dépend des spécifications UI/UX pour leur présentation.

## Detailed Requirements

- Intégrer le composant `@astrojs/image` (ou une solution équivalente comme l'utilisation de `srcset` et `sizes` manuellement) pour optimiser les images (formats modernes comme WebP/AVIF, redimensionnement, lazy loading).
- Les images doivent être responsives et s'adapter à la largeur de leur conteneur sans dépasser la largeur du contenu principal de l'article.
- Le `lazy loading` (`loading="lazy"`) doit être activé par défaut pour les images dans le corps de l'article.
- L'attribut `alt` doit être obligatoire pour toutes les images. Le CMS (gestion de fichiers MDX) doit encourager la saisie d'alternatives textuelles descriptives.
- Utiliser les balises `<figure>` et `<figcaption>` pour associer des légendes aux images et diagrammes lorsque c'est pertinent. Les légendes doivent être stylées conformément à `docs/ui-ux/ui-ux-spec.md`.
- Mettre en place une option de zoom/agrandissement pour les images et diagrammes complexes (par exemple, en utilisant une modale DaisyUI ou une bibliothèque JavaScript légère).
- Les images doivent être correctement espacées par rapport au texte environnant.
- Pour les diagrammes SVG, s'assurer qu'ils sont rendus correctement et qu'ils sont également responsives.

## Acceptance Criteria (ACs)

- AC1: Les images insérées dans les articles MDX (ex: `![Alt text](chemin/vers/image.png)`) sont optimisées (servies en WebP/AVIF si possible) et responsives.
- AC2: Le `lazy loading` est appliqué aux images.
- AC3: L'attribut `alt` est présent et utilisé pour toutes les images (vérifiable dans le HTML généré).
- AC4: Les images accompagnées d'une légende utilisent la structure `<figure><img ... /><figcaption>...</figcaption></figure>` et les légendes sont stylées correctement.
- AC5: Une fonctionnalité de zoom/agrandissement est disponible pour les images désignées comme complexes ou si spécifié (ex: via une classe CSS ou un composant wrapper).
- AC6: Les images et diagrammes SVG sont correctement affichés et s'adaptent à la largeur du conteneur.
- AC7: L'espacement vertical et horizontal autour des images/figures est conforme aux spécifications UI/UX.

## Technical Implementation Context

**Guidance:** Utiliser `@astrojs/image` pour l'optimisation d'images. Pour le zoom, une solution simple avec une modale DaisyUI et un peu de JS peut suffire pour le MVP.

- **Relevant Files:**
  - Files to Create/Modify: Configuration de `@astrojs/image` si nécessaire (souvent via `astro.config.mjs` ou directement lors de l'utilisation du composant `<Image />`). Créer un composant Astro pour le zoom (ex: `src/components/article/ZoomableImage.astro`) ou intégrer la logique dans le layout d'article/plugin MDX. Styles pour `<figure>` et `<figcaption>` dans `tailwind.config.cjs` (via plugin `prose`) ou CSS global.
  - _(Hint: See `docs/project-structure.md` for overall layout)_

- **Key Technologies:**
  - Astro (`@astrojs/image` ou composant `<Image />`)
  - MDX
  - HTML5 (`<figure>`, `<figcaption>`)
  - CSS (pour le style des légendes, espacements, et potentiellement la modale)
  - JavaScript (pour la logique de la modale de zoom)
  - DaisyUI (pour le composant `modal` si utilisé pour le zoom)
  - _(Hint: See `docs/tech-stack.md` for full list)_

- **API Interactions / SDK Usage:**
  - N/A
  - _(Hint: See `docs/api-reference.md` for details on external APIs and SDKs)_

- **UI/UX Notes:**
  - Se référer à `docs/ui-ux/ui-ux-spec.md` (Section 6.7 Images et Diagrammes).
  - Le zoom doit être activable par un clic sur l'image ou une icône discrète. La modale doit permettre de fermer facilement (bouton "fermer", clic en dehors, touche Echap).
  - S'assurer que les images en mode sombre, si elles ont des fonds transparents, restent lisibles.

- **Data Structures:**
  - La syntaxe Markdown pour les images (`![alt](src)`) est la source.
  - _(Hint: See `docs/data-models.md` for key project data structures)_

- **Environment Variables:**
  - N/A
  - _(Hint: See `docs/environment-vars.md` for all variables)_

- **Coding Standards Notes:**
  - Promouvoir l'utilisation systématique d'attributs `alt` descriptifs.
  - Le composant `<Image />` d'Astro est préférable pour l'optimisation.
  - _(Hint: See `docs/coding-standards.md` for full standards)_

## Tasks / Subtasks

- [ ] Installer et configurer `@astrojs/image` (ou s'assurer qu'il est prêt à l'emploi).
- [ ] Définir comment les auteurs spécifieront les images (Markdown standard, ou usage du composant `<Image />` directement en MDX).
- [ ] Adapter la configuration MDX ou créer des composants pour que les images Markdown standard soient traitées par `@astrojs/image` ou une logique d'optimisation équivalente.
- [ ] Implémenter les styles pour `<figure>` et `<figcaption>` via la personnalisation de `prose` ou CSS global.
- [ ] Développer la fonctionnalité de zoom/agrandissement :
    - Créer un composant `ZoomableImage.astro` ou une logique JS qui s'applique aux images concernées.
    - Utiliser une modale DaisyUI pour afficher l'image agrandie.
    - Ajouter les contrôles pour fermer la modale.
- [ ] S'assurer que `loading="lazy"` est appliqué aux images dans le contenu des articles.
- [ ] Tester l'affichage d'images de différents formats (PNG, JPG, SVG) et tailles.
- [ ] Vérifier l'accessibilité des images (présence d'alt, navigabilité du zoom).

## Testing Requirements

**Guidance:** Vérifier l'implémentation contre les ACs en utilisant les tests suivants.
- **Unit Tests:**
    - Si un composant `ZoomableImage.astro` est créé, tester sa logique d'ouverture/fermeture de modale.
- **Integration Tests (Visuels/Snapshot):**
    - Tests de snapshot sur des articles contenant des images et des figures pour vérifier la structure HTML et les classes.
- **Manual/CLI Verification:**
    - Insérer différents types d'images (avec et sans légende, SVG) dans un article de test.
    - Vérifier visuellement sur plusieurs tailles d'écran :
        - Les images sont responsives.
        - Le lazy loading fonctionne (inspecter les requêtes réseau).
        - Les attributs `alt` sont présents.
        - Les légendes sont correctement affichées et stylées.
    - Tester la fonctionnalité de zoom :
        - Le zoom s'active correctement.
        - L'image agrandie est claire.
        - La modale se ferme correctement.
    - Vérifier les espacements autour des images.
- _(Hint: See `docs/strategie-tests.md` for the overall approach)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:** {Any notes about implementation choices, difficulties, or follow-up needed}
- **Change Log:**
  - Initial Draft