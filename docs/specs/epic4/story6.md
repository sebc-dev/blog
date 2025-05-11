# Story 4.F02: Implémenter module de feedback "Article utile ?"

**Status:** Draft

## Goal & Context

**User Story:** En tant qu'Utilisateur, je veux pouvoir cliquer sur "Oui" ou "Non" à la question "Cet article a été utile ?" sur une page d'article, afin de donner rapidement mon avis sur la pertinence de l'article.

**Context:** Cette story implémente le mécanisme de feedback utilisateur sur l'utilité des articles. Elle utilisera l'endpoint backend E4-B02 pour enregistrer le vote et devra être conforme aux spécifications UI/UX.

## Detailed Requirements

Mettre en place un module interactif à la fin de chaque article demandant à l'utilisateur si l'article a été utile, avec des options "Oui" et "Non". Le vote doit être envoyé au backend et l'interface doit refléter que le vote a été pris en compte.

## Acceptance Criteria (ACs)

- AC1: Un composant Astro (ex: `FeedbackModule.astro`) est créé pour le module de feedback.
- AC2: Le composant est intégré à la fin du contenu principal des pages d'articles, conformément à la section 6.8.2 ("Module de Feedback 'Article utile ?'") de `docs/ui-ux/ui-ux-spec.md`.
- AC3: Le module affiche la question (localisée) "Cet article a été utile ?" et deux boutons : "Oui" et "Non".
- AC4: Au clic sur "Oui" ou "Non", un appel JavaScript asynchrone et non bloquant est effectué vers l'endpoint backend `POST /api/v1/metrics/article/{articleCanonicalSlug}/{lang}/feedback` avec le payload `{"vote": "yes"}` ou `{"vote": "no"}`.
- AC5: Les `articleCanonicalSlug` et `lang` corrects sont extraits du contexte de la page de l'article et envoyés à l'API.
- AC6: Après un vote réussi (confirmé par l'API ou en mode optimiste), le module affiche un message de remerciement (ex: "Merci pour votre feedback !") et les boutons "Oui"/"Non" sont désactivés ou masqués.
- AC7: Pour éviter les soumissions multiples pendant la même session utilisateur, l'état "voté" pour un article donné est mémorisé (ex: via `sessionStorage` ou `localStorage` limité à la session). Si l'état "voté" existe, le module s'affiche directement avec le message de remerciement.
- AC8: L'échec de l'appel API de comptage est géré discrètement (ex: log console) et ne bloque pas l'interface. L'interface peut ou non refléter l'échec, pour le MVP un échec silencieux est acceptable.

## Technical Implementation Context

**Guidance:** Utiliser les détails suivants pour l'implémentation. Consulter les fichiers `docs/` liés pour un contexte plus large si nécessaire.

- **Relevant Files:**
  - Files to Create:
    - `frontend/src/components/article/FeedbackModule.astro`
  - Files to Modify:
    - Le layout des articles pour inclure le `FeedbackModule.astro`.
    - `frontend/src/lib/apiService.ts` (créé ou modifié dans E4-F03) pour la fonction d'appel à l'API `/feedback`.
  - _(Hint: Voir `docs/project-structure.md` pour la structure globale)_

- **Key Technologies:**
  - Astro, TypeScript/JavaScript, HTML, CSS (TailwindCSS, DaisyUI).
  - `sessionStorage` ou `localStorage` pour mémoriser l'état du vote.
  - _(Hint: Voir `docs/architecture/tech-stack.md` pour la liste complète)_

- **API Interactions / SDK Usage:**
  - Appel `POST` à l'endpoint `/api/v1/metrics/article/{articleCanonicalSlug}/{lang}/feedback` avec payload `{"vote": "yes"|"no"}` (défini dans `docs/architecture/api-reference.md`).

- **UI/UX Notes:**
  - Se conformer strictement à la section 6.8.2 de `docs/ui-ux/ui-ux-spec.md` pour le design, le positionnement, la question, les boutons, et le message de remerciement.
  - Assurer l'accessibilité des boutons et du message de remerciement.

- **Data Structures:**
  - Payload de la requête: `{"vote": "yes"}` ou `{"vote": "no"}`.
  - Stockage local : ex: `sessionStorage.setItem('feedback_voted_{articleCanonicalSlug}_{lang}', 'true');`

- **Environment Variables:**
  - `PUBLIC_API_BASE_URL` pour construire l'URL de l'API backend.
  - _(Hint: Voir `docs/setup/environnement-vars.md` pour toutes les variables)_

- **Coding Standards Notes:**
  - Code JavaScript/TypeScript pour gérer l'état d'affichage (question ou remerciement), l'interaction avec `sessionStorage`, et l'appel API.
  - _(Hint: Voir `docs/contribution/normes-codage.md` pour les standards complets)_

## Tasks / Subtasks

- [ ] Créer le composant `FeedbackModule.astro`.
- [ ] Afficher la question et les boutons "Oui"/"Non".
- [ ] Au chargement du composant, vérifier `sessionStorage` si l'utilisateur a déjà voté pour cet article/langue. Si oui, afficher directement le message de remerciement.
- [ ] Implémenter les gestionnaires de clic pour les boutons "Oui" et "Non".
  - [ ] Préparer le payload `{"vote": "yes"}` ou `{"vote": "no"}`.
  - [ ] Appeler la fonction de service (dans `apiService.ts`) pour envoyer la requête à l'API `/feedback`.
  - [ ] En cas de succès (ou en mode optimiste), mettre à jour l'UI pour afficher le message de remerciement, désactiver/masquer les boutons, et marquer comme voté dans `sessionStorage`.
- [ ] Intégrer le composant `FeedbackModule.astro` dans le layout des articles.
- [ ] Styliser le module selon `docs/ui-ux/ui-ux-spec.md`.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.

- **Unit Tests (Vitest):**
  - Tester la logique de gestion de `sessionStorage` (set, get, check) si elle est isolée dans des fonctions utilitaires.
- **Component Tests (Vitest avec Astro Testing Library ou équivalent):**
  - Vérifier l'affichage initial du module (question et boutons).
  - Simuler un clic sur "Oui", vérifier que l'API mockée est appelée avec "yes", et que l'UI se met à jour (remerciement).
  - Simuler un clic sur "Non", vérifier que l'API mockée est appelée avec "no", et que l'UI se met à jour.
  - Vérifier qu'après un vote, les boutons sont désactivés/masqués.
  - Vérifier que si `sessionStorage` indique un vote précédent, le module affiche directement le message de remerciement.
- **E2E Tests (Cypress):**
  - Sur une page d'article :
    - Voter "Oui", vérifier l'appel API (interception réseau) et le changement d'UI.
    - Recharger la page et vérifier que le module affiche toujours l'état "remerciement" (grâce à `sessionStorage`).
    - (Optionnel, si nouvelle session Cypress) Sur un autre article ou après avoir vidé `sessionStorage`, voter "Non" et vérifier.
- _(Hint: Voir `docs/tests/strategie-tests.md` pour l'approche globale)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:**
- **Change Log:**
  - Initial Draft