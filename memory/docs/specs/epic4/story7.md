# Story 4.F03: Gérer les appels API frontend de manière asynchrone et non bloquante

**Status:** Draft

## Goal & Context

**User Story:** En tant que Développeur Frontend (DevFE), je veux gérer les appels API vers le backend pour le comptage de manière asynchrone et non bloquante pour l'utilisateur, afin de s'assurer que l'expérience utilisateur n'est pas dégradée si l'API de comptage est lente ou indisponible.

**Context:** Cette story technique est cruciale pour la robustesse des fonctionnalités d'interaction utilisateur (E4-F01, E4-F02). Elle définit comment les appels aux APIs backend (E4-B01, E4-B02) doivent être implémentés côté client.

## Detailed Requirements

Implémenter les fonctions JavaScript/TypeScript côté client qui effectuent les appels aux endpoints backend `/share` et `/feedback`. Ces fonctions doivent être asynchrones, utiliser `Workspace` (ou une librairie équivalente comme `Astro.locals.fetch` si contexte serveur ou client-side `Workspace`), et inclure une gestion d'erreur de base pour ne pas interrompre l'expérience utilisateur principale.

## Acceptance Criteria (ACs)

- AC1: Un service ou des fonctions utilitaires sont créés (ex: dans `frontend/src/lib/apiService.ts`) pour encapsuler les appels aux endpoints `/api/v1/metrics/article/{articleCanonicalSlug}/{lang}/share` et `/api/v1/metrics/article/{articleCanonicalSlug}/{lang}/feedback`.
- AC2: Toutes les fonctions d'appel API utilisent `async/await` et l'API `Workspace` (ou équivalent).
- AC3: Les fonctions d'appel sont conçues pour être non bloquantes pour le thread principal du navigateur.
- AC4: Les paramètres `articleCanonicalSlug`, `lang`, et le payload (`vote` pour feedback) sont correctement passés aux fonctions et inclus dans les requêtes API.
- AC5: L'URL de base de l'API (ex: `PUBLIC_API_BASE_URL`) est utilisée pour construire les URLs complètes des endpoints.
- AC6: Une gestion d'erreur minimale est en place pour les appels API :
    - Les erreurs réseau ou les réponses HTTP d'erreur (ex: 4xx, 5xx) sont interceptées (ex: bloc `try/catch`, vérification de `response.ok`).
    - En cas d'erreur, un message est logué en console (`console.error`).
    - L'échec d'un appel API pour le comptage ne doit **pas** afficher d'erreur intrusive à l'utilisateur (popup, alerte) ni empêcher d'autres interactions sur la page.
- AC7: Les fonctions retournent une promesse qui se résout (potentiellement avec les données de réponse du backend si nécessaire pour l'UI) ou se rejette de manière contrôlée en cas d'erreur.

## Technical Implementation Context

**Guidance:** Utiliser les détails suivants pour l'implémentation. Consulter les fichiers `docs/` liés pour un contexte plus large si nécessaire.

- **Relevant Files:**
  - Files to Create/Modify:
    - `frontend/src/lib/apiService.ts` (centraliser les appels API ici)
  - Files to Modify (pour utiliser `apiService.ts`):
    - `frontend/src/components/article/ShareButtons.astro` (ou son script associé)
    - `frontend/src/components/article/FeedbackModule.astro` (ou son script associé)
  - _(Hint: Voir `docs/project-structure.md` pour la structure globale)_

- **Key Technologies:**
  - TypeScript/JavaScript, API `Workspace`.
  - _(Hint: Voir `docs/architecture/tech-stack.md` pour la liste complète)_

- **API Interactions / SDK Usage:**
  - Implémentation des clients HTTP pour les endpoints spécifiés dans `docs/architecture/api-reference.md`.
  - `POST` pour les deux endpoints.
  - Gestion des headers (ex: `Content-Type: application/json` pour le feedback).

- **UI/UX Notes:** L'aspect principal ici est la non-interruption de l'UX en cas d'échec. Pas d'éléments visuels directs pour cette story, mais elle impacte comment E4-F01 et E4-F02 se comportent en cas de problème réseau.

- **Data Structures:**
  - Pour l'appel feedback : `body: JSON.stringify({ vote: "yes"|"no" })`.

- **Environment Variables:**
  - `PUBLIC_API_BASE_URL` est essentiel.
  - _(Hint: Voir `docs/setup/environnement-vars.md` pour toutes les variables)_

- **Coding Standards Notes:**
  - Utilisation systématique de `async/await`.
  - Blocs `try/catch` pour la gestion des erreurs des promesses `Workspace`.
  - Fonctions bien typées si utilisation de TypeScript.
  - Conformité avec la section "Error Handling" de `docs/contribution/normes-codage.md`.
  - _(Hint: Voir `docs/contribution/normes-codage.md` pour les standards complets)_

## Tasks / Subtasks

- [ ] Créer (ou structurer si déjà existant) le fichier `frontend/src/lib/apiService.ts`.
- [ ] Implémenter une fonction `recordShare(articleCanonicalSlug: string, lang: string): Promise<void | ResponseData>`:
  - [ ] Construit l'URL correcte pour l'endpoint `/share`.
  - [ ] Effectue un appel `POST` asynchrone.
  - [ ] Inclut la gestion d'erreur (try/catch, log console).
- [ ] Implémenter une fonction `recordFeedback(articleCanonicalSlug: string, lang: string, vote: 'yes' | 'no'): Promise<void | ResponseData>`:
  - [ ] Construit l'URL correcte pour l'endpoint `/feedback`.
  - [ ] Effectue un appel `POST` asynchrone avec le payload JSON approprié.
  - [ ] Inclut la gestion d'erreur (try/catch, log console).
- [ ] Refactoriser les composants `ShareButtons` (de E4-F01) et `FeedbackModule` (de E4-F02) pour utiliser ces fonctions de `apiService.ts`.
- [ ] S'assurer que les appels depuis les composants sont bien `await`ed ou gérés via `.then().catch()` pour ne pas bloquer, et que les erreurs sont gérées comme spécifié.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.

- **Unit Tests (Vitest):**
  - Tester les fonctions dans `apiService.ts`.
  - Mocker l'API `Workspace` globale pour simuler :
    - Des réponses API réussies (ex: `200 OK`).
    - Des erreurs réseau.
    - Des réponses HTTP d'erreur (ex: `400 Bad Request`, `500 Internal Server Error`).
  - Vérifier que les URLs sont correctement construites, que les méthodes HTTP et les payloads sont corrects.
  - Vérifier que `console.error` est appelé en cas d'erreur et que la promesse est rejetée ou gérée.
- **Integration/Component Tests (pour les composants qui utilisent `apiService.ts`):**
  - S'assurer que les composants `ShareButtons` et `FeedbackModule` appellent correctement les fonctions mockées de `apiService.ts` et gèrent les retours (succès/échec de la promesse) sans planter l'UI.
- _(Hint: Voir `docs/tests/strategie-tests.md` pour l'approche globale)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:**
- **Change Log:**
  - Initial Draft