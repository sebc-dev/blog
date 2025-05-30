# Blog Technique Bilingue UI/UX Specification

## Introduction

Ce document définit les spécifications d'interface utilisateur et d'expérience utilisateur pour le projet "Blog Technique Bilingue". L'objectif est de fournir une expérience de navigation et de lecture optimale qui met en valeur le contenu technique bilingue sur Tauri, l'IA pour développeurs et l'UX desktop.

- **Objectifs UX principaux:** Lisibilité optimale, navigation intuitive, distinction claire des thématiques, et mise en valeur du caractère bilingue du blog.
- **Public cible:** Développeurs full-stack (JavaScript/TypeScript & Java, 25-45 ans)

## Overall UX Goals & Principles

- **Target User Personas:** Développeurs full-stack intéressés par Tauri, l'IA et l'UX desktop, tant francophones qu'anglophones.
- **Usability Goals:** 
  - Facilité de navigation entre les langues
  - Lecture confortable des articles techniques
  - Découverte intuitive du contenu par thématique
  - Performance optimale (Core Web Vitals)
- **Design Principles:**
  - Clarté et lisibilité avant tout
  - Organisation thématique cohérente
  - Transition fluide entre les langues
  - Expérience responsive unifiée

## Information Architecture (IA)

- **Site Map / Screen Inventory:**
  ```mermaid
  graph TD
      A[Page d'accueil] --> B(Page de listing du blog)
      A --> C(Pages des piliers thématiques)
      A --> D(À propos)
      B --> E[Pages d'articles individuels]
      C --> E
  ```

- **Navigation Structure:** 
  - Navigation principale dans le header (Accueil, Blog, Piliers thématiques, À propos)
  - Navigation contextuelle par piliers thématiques
  - Sélecteur de langue global dans le header
  - Fil d'Ariane pour la navigation hiérarchique

## User Flows

### Navigation entre langues

- **Goal:** Permettre à l'utilisateur de basculer facilement entre français et anglais.
- **Steps / Diagram:**
  ```mermaid
  graph TD
      Start[Utilisateur sur une page] --> SeeSelector[Voit le sélecteur de langue]
      SeeSelector --> ClickLanguage[Clique sur l'autre langue]
      ClickLanguage --> CheckTranslation{Traduction existe?}
      CheckTranslation -- Oui --> NavigateToTranslation[Accède à la version traduite]
      CheckTranslation -- Non --> NavigateToEquivalent[Accède à la page équivalente]
      NavigateToEquivalent --> StorePreference[Préférence de langue stockée]
      NavigateToTranslation --> StorePreference
  ```

### Découverte de contenu par thématique

- **Goal:** Permettre aux utilisateurs de découvrir du contenu selon leurs centres d'intérêt.
- **Steps / Diagram:**
  ```mermaid
  graph TD
      Start[Page d'accueil] --> PillarSection[Section des piliers thématiques]
      PillarSection --> SelectPillar[Sélectionne un pilier]
      SelectPillar --> PillarPage[Page de thématique]
      PillarPage --> FilterAndSort[Filtre et tri par critères]
      FilterAndSort --> FindArticle[Trouve un article pertinent]
      FindArticle --> ReadArticle[Lit l'article]
      ReadArticle --> RelatedArticles[Découvre articles connexes]
  ```

## Detailed Components & Pages Specifications

### 1. Page d'accueil

#### 1.1. Header Global

- **Positionnement:** En haut de chaque page, sticky
- **Éléments:**
  - Logo/Titre du Blog (lien vers page d'accueil dans la langue courante)
  - Navigation Principale (`<nav>`)
    - Liens: "Accueil", "Blog", piliers thématiques, "À Propos"
    - **Indication visuelle du lien actif:** surlignage, changement de couleur ou underline
  - Sélecteur de Langue (FR/EN)
  - Sélecteur de Thème (Clair/Sombre)
  - Barre de Recherche (discrète ou extensible)
- **Style:** Fond légèrement contrasté, ombrage subtil pour le démarquer
- **Responsive:** Menu hamburger sur mobile

#### 1.2. Section Hero (pleine hauteur)

- **Hauteur:** 100vh (pleine hauteur de la fenêtre)
- **Disposition:** Centrée verticalement et horizontalement
- **Éléments:**
  - **Photo de profil:**
    - Format rond ou carré aux bords arrondis
    - Taille: environ 150-180px
    - Ombre portée légère
  - **Texte de présentation:**
    - Titre principal (Blog Technique Bilingue) en grand
    - Sous-titre expliquant la proposition de valeur
    - Espacement généreux, typographie claire
  - **Légende:** "Explorez nos piliers thématiques:"
  - **Bouton de défilement:**
    - Icône de flèche vers le bas, centrée horizontalement
    - Position: bas de l'écran (env. 20-30px du bas)
    - Animation subtile d'impulsion
    - Défilement smooth vers la section suivante au clic

#### 1.3. Section Piliers de Contenu

- **Titre:** "Nos Piliers Thématiques" ou équivalent
- **Disposition:** Rangée de 3-4 cartes (grille responsive)
- **Par Pilier:**
  - Icône représentative
  - Titre du pilier (ex: "Tauri", "IA pour Développeurs", "UX Desktop")
  - Description courte (1-2 phrases)
  - Couleur d'accent spécifique au pilier
  - Lien vers la page de catégorie correspondante
- **Effet au survol:** Élévation légère, animation subtile
- **Responsive:** Empilé verticalement sur petit écran

#### 1.4. Section Articles Récents (grille)

- **En-tête de section:**
  - Titre "Articles Récents" à gauche
  - Lien "Voir tous" à droite pointant vers la page blog
- **Grille d'articles:**
  - Disposition: 3 colonnes desktop, 2 tablette, 1 mobile
  - Gap uniforme entre les cartes (24-32px)
  - 6-9 articles récents au total
- **Cartes d'articles (voir 3.1 pour détails):**
  - Structure complète comme décrite dans la section 3.1
  - Rangées responsives selon la taille d'écran

#### 1.5. Footer Global

- **Contenu:**
  - Copyright et mentions légales
  - Liens secondaires (optionnel pour MVP)
  - Rappel des liens principaux
  - Sélecteur de langue alternatif
  - Liens réseaux sociaux (si applicable)
- **Style:** Discret, conforme au thème

### 2. Page de Listing du Blog

#### 2.1. Structure Principale

- **En-tête:**
  - Titre "Tous les Articles" (ou titre filtré selon contexte)
  - Description courte de la section
  - Fil d'Ariane (Accueil > Blog)

- **Structure à 3 colonnes:**
  ```
  ┌────────────────────────────────────────────────────────────┐
  │ Header                                                     │
  ├────────────────────────────────────────────────────────────┤
  │ Fil d'Ariane: Accueil > Blog                              │
  ├────────────────────────────────────────────────────────────┤
  │ Titre: "Tous les Articles" + Description                   │
  ├────────┬─────────────────────────────────┬────────────────┤
  │        │                                 │                │
  │        │                                 │                │
  │ Filtres│        Grille d'Articles        │                │
  │   et   │                                 │                │
  │ Options│                                 │                │
  │        │                                 │                │
  │        │                                 │                │
  │        │                                 │                │
  │        │                                 │                │
  ├────────┴─────────────────────────────────┴────────────────┤
  │ Pagination                                                │
  ├────────────────────────────────────────────────────────────┤
  │ Footer                                                    │
  └────────────────────────────────────────────────────────────┘
  ```

#### 2.2. Bloc de Filtrage (gauche)

- **Position:** Colonne flottante à gauche
- **Composants:**
  - **Barre de recherche:**
    - Champ texte avec icône de loupe
    - Placeholder: "Rechercher des articles..."
    - Recherche instantanée ou au submit
  - **Filtres par catégories:**
    - Badges colorés selon le code couleur des piliers
    - Compteur d'articles par catégorie
    - Sélection multiple possible
  - **Filtres par tags:**
    - Liste de tags populaires
    - Format de badge plus discret
    - Option "Voir plus de tags"
  - **Options de tri:**
    - Sélecteur pour trier par:
      - Date (plus récent d'abord)
      - Popularité (partages, lectures)
      - Pertinence (si recherche active)
  - **Filtres additionnels:**
    - Cases à cocher pour:
      - Langue (afficher uniquement FR ou EN)
      - Type de contenu (tutoriels, concepts, etc.)
      - Niveau (débutant, intermédiaire, avancé)
- **Style:** Fond légèrement contrasté, frontières subtiles
- **Responsive:** Devient un accordéon ou menu en overlay sur mobile

#### 2.3. Grille d'Articles

- **Disposition:** Grille responsive de cartes d'articles
  - Desktop: 2-3 colonnes
  - Tablette: 2 colonnes
  - Mobile: 1 colonne
- **Cartes:** Voir structure détaillée en section 3.1
- **Pagination:**
  - Navigation numérotée (avec ellipsis pour les longues listes)
  - Boutons Précédent/Suivant
  - Indication du nombre total de pages
  - Style en accord avec le thème global (composant DaisyUI)

### 3. Page d'Article

#### 3.1. Structure Globale

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Header (Logo, Navigation, Sélecteur langue/thème)                       │
├─────────────────────────────────────────────────────────────────────────┤
│ Fil d'Ariane: Accueil > Blog > [Catégorie] > Titre article             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─────┐  ┌───────────────────────────────────┐  ┌─────────────────┐     │
│ │     │  │ Titre de l'article (h1)          │  │                 │     │
│ │     │  ├───────────────────────────────────┤  │                 │     │
│ │     │  │ [Tags] · Date · Temps de lecture  │  │                 │     │
│ │  P  │  ├───────────────────────────────────┤  │                 │     │
│ │  A  │  │                                   │  │                 │     │
│ │  R  │  │                                   │  │     TABLE       │     │
│ │  T  │  │                                   │  │       DES       │     │
│ │  A  │  │                                   │  │    MATIÈRES     │     │
│ │  G  │  │      CONTENU PRINCIPAL           │  │                 │     │
│ │  E  │  │   (largeur optimale ~700-800px)   │  │   • Section 1   │     │
│ │     │  │                                   │  │    • Sous-sec 1 │     │
│ │     │  │                                   │  │    • Sous-sec 2 │     │
│ │     │  │                                   │  │   • Section 2   │     │
│ │     │  │                                   │  │                 │     │
│ │     │  │                                   │  │  [Indicateur de │     │
│ │     │  │                                   │  │   progression]  │     │
│ └─────┘  └───────────────────────────────────┘  └─────────────────┘     │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Module "Cet article vous a-t-il été utile ? Oui/Non"                │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Articles dans la même catégorie                                     │ │
│ │ ┌────────────┐   ┌────────────┐   ┌────────────┐                    │ │
│ │ │ Article 1  │   │ Article 2  │   │ Article 3  │                    │ │
│ │ └────────────┘   └────────────┘   └────────────┘                    │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ Footer                                                                  │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 3.2. Fil d'Ariane

- **Position:** Sous le header, pleine largeur
- **Format:** Accueil > Blog > [Catégorie] > Titre court de l'article
- **Style:** Discret mais lisible, avec séparateurs visuels
- **Comportement:** Liens cliquables pour chaque niveau

#### 3.3. Contenu Principal de l'Article

- **Largeur:** Fixe et optimale pour la lecture (700-800px)
- **Typographie:**
  - Titre (h1): Grand, clair, contraste élevé
  - Métadonnées: Sous le titre, incluant tags, date, temps de lecture
  - Corps: Taille 16-18px, interligne 1.6-1.8
  - Titres de section: Hiérarchie claire h2, h3, h4
- **Blocks de code:**
  - Coloration syntaxique adaptée au mode clair/sombre
  - Bouton "Copier" en haut à droite
  - Numérotation des lignes pour les snippets longs
  - Indication du langage
  - Défilement horizontal pour le code qui dépasse
- **Images et diagrammes:**
  - Largeur adaptée au conteneur
  - Légendes sous les images
  - Alt text descriptif
  - Option de zoom/agrandissement pour les diagrammes complexes
- **Liens:**
  - Style distinctif (couleur, soulignement)
  - Indication visuelle des liens externes

#### 3.4. Table des Matières Flottante (droite)

- **Position:** Colonne flottante droite, sticky
- **Comportement:**
  - Suit le défilement (position sticky)
  - Highlight de la section active pendant le défilement
  - Liens cliquables vers chaque section
- **Composants:**
  - Titre "Table des matières"
  - Liste hiérarchique des titres h2 et h3
  - Indicateur de progression de lecture vertical
  - Pourcentage de progression en bas
- **Seuil d'affichage:** Visible seulement si l'article contient au moins 3 sections
- **Responsive:** Se transforme en menu déroulant sur les écrans étroits

#### 3.5. Barre de Partage Flottante (gauche)

- **Position:** Colonne flottante gauche, sticky
- **Orientation:** Verticale
- **Boutons:**
  - Twitter/X
  - LinkedIn
  - Facebook
  - Reddit
  - Copier le lien
  - Option "Plus" (dépliant)
- **Style:**
  - Icônes simples avec info-bulle au survol
  - Compteur global de partages en haut
  - Animation subtile au survol
- **Responsive:** Devient horizontale et se place sous l'article sur mobile

#### 3.6. Module de Feedback Article

- **Position:** Sous le contenu principal
- **Format:** "Cet article vous a-t-il été utile ?" avec boutons Oui/Non
- **Comportement:**
  - Envoi asynchrone au backend (API Spring Boot)
  - Message de remerciement après soumission
  - Une seule soumission par session

#### 3.7. Section Articles Connexes

- **Position:** Bas de page, après le module de feedback
- **Titre:** "Articles dans la même catégorie" ou "Sur le même sujet"
- **Contenu:** 3-4 cartes d'articles de la même catégorie ou avec tags similaires
- **Disposition:** Rangée horizontale, défilement horizontal sur mobile
- **Cards:** Version compacte des cartes d'articles (image plus petite)

### 4. Cards d'Articles (Composant Réutilisable)

- **Structure:**
  ```
  ┌────────────────────────────────────────┐
  │                                        │
  │              [Image]                   │
  │                                        │
  ├────────────────────────────────────────┤
  │ [Tag] · 5 min · 01/05/2025            │
  ├────────────────────────────────────────┤
  │ Titre de l'article                     │
  ├────────────────────────────────────────┤
  │ Extrait de l'article qui donne         │
  │ une idée du contenu...                 │
  ├────────────────────────────────────────┤
  │ 👍 87% utile  │  🔗 32 partages        │
  └────────────────────────────────────────┘
  ```

- **Composants:**
  - **Image d'en-tête:**
    - Ratio 16:9
    - Object-fit: cover
    - Alt text significatif
    - Lazy loading
  - **Métadonnées:**
    - Tag principal (couleur correspondant au pilier)
    - Temps de lecture estimé
    - Date de publication/mise à jour
  - **Titre:**
    - Taille plus grande
    - Font-weight: semibold
    - Troncature si nécessaire (2 lignes max)
  - **Extrait:**
    - 2-3 lignes maximum
    - Troncature avec ellipsis
    - Style plus léger que le titre
  - **Statistiques (si disponibles):**
    - Pourcentage d'utilité (👍 xx%)
    - Nombre de partages (🔗 xx)
- **Comportement:**
  - Carte entière cliquable
  - Effet hover: légère élévation ou changement de bordure
  - Les images se chargent progressivement (lazy loading)

## Responsive Design Considerations

### Breakpoints

- **Mobile:** < 640px
- **Tablette:** 640px - 1024px
- **Desktop:** > 1024px
- **Grand écran:** > 1280px

### Adaptations Spécifiques

- **Header:**
  - Desktop: Navigation complète
  - Mobile: Menu hamburger + logo + sélecteur de langue

- **Hero Section:**
  - Desktop: Layout horizontal
  - Mobile: Layout vertical, photo plus petite

- **Grille d'articles:**
  - Desktop: 3 colonnes
  - Tablette: 2 colonnes
  - Mobile: 1 colonne

- **Page d'article:**
  - Desktop: 3 colonnes (partage, contenu, ToC)
  - Tablette: 2 colonnes (contenu, ToC)
  - Mobile: 1 colonne, ToC en menu déroulant en haut, partage horizontal en bas

- **Filtres blog:**
  - Desktop: Sidebar fixe
  - Mobile: Filtres dépliables/accordéon ou modal

## Accessibility Considerations

- **Contraste:** Conforme WCAG 2.1 AA (4.5:1 pour texte normal, 3:1 pour grand texte)
- **Navigation clavier:** Focus visible et logique sur tous les éléments interactifs
- **Images:** Alt text complet et descriptif
- **Structure:** Hiérarchie des titres correcte et sémantique
- **ARIA:** Attributs appropriés pour les éléments dynamiques
- **Liens d'évitement:** Skip to content link en haut de page

## Considérations Techniques

### 1. Performance

- **Images optimisées** avec format WebP/AVIF via `@astrojs/image`
- **Code splitting** natif d'Astro pour JS minimal
- **Critical CSS** inline pour le chargement initial
- **Lazy loading** pour les images hors écran
- **Pagination et chargement progressif** pour les longues listes

### 2. Implementation Stack

- **Astro** pour la génération statique du site
- **TailwindCSS** et **DaisyUI** pour les styles
- **MDX** pour le contenu des articles
- **Spring Boot** (backend) pour les API de comptage

## Change Log

| Change        | Date       | Version | Description                      | Author          |
| ------------- | ---------- | ------- | -------------------------------- | --------------- |
| Initial draft | 2025-05-11 | 0.1     | Spécifications UI/UX initiales   | Claude          |
