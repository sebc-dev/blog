# Story 4.F01: Implémenter les boutons de partage social sur les articles

**Status:** Draft

## Goal & Context

**User Story:** En tant qu'Utilisateur, je veux pouvoir cliquer sur des boutons de partage social (Twitter/X, LinkedIn, Reddit, Copier Lien) sur une page d'article, afin de partager facilement un article intéressant avec mon réseau.

**Context:** Cette story implémente la fonctionnalité de partage visible par l'utilisateur. Elle s'appuiera sur l'endpoint backend E4-B01 pour le comptage anonyme et devra être conforme aux spécifications UI/UX pour l'affichage et l'interaction.

## Detailed Requirements

Mettre en place des boutons de partage social cliquables sur les pages d'articles pour les plateformes Twitter/X, LinkedIn, Reddit, ainsi qu'une option pour copier le lien de l'article. Chaque action de partage doit également déclencher un appel API au backend pour le comptage.

## Acceptance Criteria (ACs)

- AC1: Un composant Astro (ex: `ShareButtons.astro`) est créé pour afficher les boutons de partage.
- AC2: Le composant est intégré dans le layout des pages d'articles, conformément à la section 6.8.1 ("Boutons de Partage Social") de `docs/ui-ux/ui-ux-spec.md` (positionnement, style des icônes SVG, `btn btn-ghost btn-square`, tooltip).
- AC3: Les boutons pour Twitter/X, LinkedIn, et Reddit sont présents et fonctionnels : au clic, ils ouvrent une nouvelle fenêtre/onglet avec l'URL de partage pré-remplie pour le réseau social concerné (titre de l'article et URL).
- AC4: Un bouton "Copier Lien" est présent et fonctionnel : au clic, il copie l'URL de l'article actuel dans le presse-papiers de l'utilisateur et affiche un feedback visuel temporaire (ex: tooltip "Lien copié !").
- AC5: Pour chaque action de partage initiée (clic sur Twitter/X, LinkedIn, Reddit), un appel JavaScript asynchrone et non bloquant est effectué vers l'endpoint backend `POST /api/v1/metrics/article/{articleCanonicalSlug}/{lang}/share` pour incrémenter le compteur. L'action de "Copier Lien" déclenche aussi cet appel.
- AC6: Les `articleCanonicalSlug` et `lang` corrects sont extraits du contexte de la page de l'article et envoyés à l'API.
- AC7: L'échec de l'appel API de comptage ne doit pas empêcher l'action de partage principale (ouverture de la fenêtre de partage ou copie du lien).

## Technical Implementation Context

**Guidance:** Utiliser les détails suivants pour l'implémentation. Consulter les fichiers `docs/` liés pour un contexte plus large si nécessaire.

- **Relevant Files:**
  - Files to Create:
    - `frontend/src/components/article/ShareButtons.astro`
    - Potentiellement un petit script client ou une fonction dans `frontend/src/lib/socialShare.ts` pour la logique de partage et d'appel API.
  - Files to Modify:
    - Le layout des articles (ex: `frontend/src/layouts/ArticleLayout.astro` ou équivalent) pour inclure le composant `ShareButtons.astro`.
    - `frontend/src/lib/apiService.ts` (créé ou modifié dans E4-F03) pour la fonction d'appel à l'API `/share`.
  - _(Hint: Voir `docs/project-structure.md` pour la structure globale)_

- **Key Technologies:**
  - Astro, TypeScript/JavaScript, HTML, CSS (TailwindCSS, DaisyUI).
  - API `navigator.clipboard` pour la fonctionnalité "Copier Lien".
  - _(Hint: Voir `docs/architecture/tech-stack.md` pour la liste complète)_

- **API Interactions / SDK Usage:**
  - Appel `POST` à l'endpoint `/api/v1/metrics/article/{articleCanonicalSlug}/{lang}/share` (défini dans `docs/architecture/api-reference.md`).
  - Construction des URLs de partage pour chaque réseau social.

- **UI/UX Notes:**
  - Se conformer strictement à la section 6.8.1 de `docs/ui-ux/ui-ux-spec.md` pour le design, le positionnement (barre latérale gauche flottante sur desktop, adaptation mobile), et les interactions (icônes, tooltips).
  - Utiliser les icônes SVG spécifiées (Heroicons, Feather Icons, ou Remix Icon).

- **Data Structures:** Pas de structure de données complexe pour cette story frontend, si ce n'est l'URL et le titre de l'article à partager.

- **Environment Variables:**
  - `PUBLIC_API_BASE_URL` pour construire l'URL de l'API backend.
  - `PUBLIC_SITE_URL` pour construire l'URL complète de l'article à partager.
  - _(Hint: Voir `docs/setup/environnement-vars.md` pour toutes les variables)_

- **Coding Standards Notes:**
  - Code JavaScript/TypeScript propre et modulaire.
  - Utilisation d'`async/await` pour les appels API.
  - Assurer l'accessibilité des boutons (ex: `aria-label`).
  - _(Hint: Voir `docs/contribution/normes-codage.md` pour les standards complets)_

## Tasks / Subtasks

- [ ] Créer le composant `ShareButtons.astro`.
- [ ] Intégrer les icônes SVG pour Twitter/X, LinkedIn, Reddit, et "Copier Lien".
- [ ] Implémenter la logique d'ouverture des fenêtres de partage pour chaque réseau social avec les URLs et titres appropriés.
- [ ] Implémenter la fonctionnalité "Copier Lien" utilisant `navigator.clipboard.writeText()` et un feedback visuel.
- [ ] Dans le script du composant ou un service séparé, implémenter la fonction d'appel asynchrone à l'API `/share` via `apiService.ts`.
- [ ] Ajouter le composant `ShareButtons.astro` au layout des articles.
- [ ] Styliser le composant et ses interactions (hover, focus, tooltips) selon `docs/ui-ux/ui-ux-spec.md`.
- [ ] Gérer l'extraction dynamique du `articleCanonicalSlug` et `lang` sur la page de l'article.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.

- **Unit Tests (Vitest):**
  - Tester les fonctions utilitaires (ex: construction des URLs de partage, logique de copie) si elles sont isolées.
- **Component Tests (Vitest avec Astro Testing Library ou équivalent):**
  - Vérifier que le composant `ShareButtons.astro` s'affiche correctement avec les bons icônes/boutons.
  - Simuler des clics sur les boutons et vérifier que les fonctions appropriées (ouverture de lien, copie, appel API mocké) sont appelées.
- **E2E Tests (Cypress):**
  - Sur une page d'article de test :
    - Cliquer sur chaque bouton de partage et vérifier que la bonne URL de partage s'ouvre (on ne testera pas le partage effectif sur le réseau).
    - Cliquer sur "Copier Lien" et vérifier (si possible via Cypress) que le presse-papiers contient la bonne URL et qu'un feedback est affiché.
    - Intercepter l'appel réseau vers l'API `/share` et vérifier qu'il est fait avec les bons paramètres lors d'un clic.
- _(Hint: Voir `docs/tests/strategie-tests.md` pour l'approche globale)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:**
- **Change Log:**
  - Initial Draft