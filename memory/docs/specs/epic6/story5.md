# Story 6.P01: Publier les 20 articles initiaux sur le site de production

**Status:** Draft

## Goal & Context

**User Story:** En tant qu'Admin/Dev, je veux publier les 20 articles initiaux (10 FR, 10 EN) sur le site de production au moment du lancement, afin de lancer le blog avec une offre de contenu crédible et engageante.

**Context:** C'est la dernière étape de l'Epic 6, qui rend le contenu initial effectivement disponible pour les utilisateurs finaux. Elle suppose que toutes les étapes précédentes de création, traduction, et validation (E6-C01 à E6-C04) sont terminées.

## Detailed Requirements

Mettre à jour le statut des 20 articles initiaux pour qu'ils ne soient plus des brouillons. Intégrer ces articles dans la branche principale du dépôt Git. Déclencher le pipeline de CI/CD pour déployer ces articles sur l'environnement de production. Vérifier que les articles sont bien en ligne et accessibles.

## Acceptance Criteria (ACs)

- AC1: Les 20 articles de lancement (10 en français, 10 en anglais) ont leur champ `isDraft` (ou équivalent) dans le frontmatter positionné à `false`.
- AC2: Tous les fichiers MDX correspondants, avec leur frontmatter finalisé, sont commités et mergés sur la branche principale (ex: `main`) du dépôt Git.
- AC3: Le pipeline de CI/CD (défini dans Epic 7, mais son exécution est nécessaire ici) se déclenche et complète avec succès le build et le déploiement en production.
- AC4: Les 20 articles sont visibles et accessibles sur le site en production via leurs URLs respectives.
- AC5: Les articles apparaissent correctement dans les pages de listing du blog, les listings par catégorie/pilier, et les résultats de recherche interne (si la recherche est déjà fonctionnelle).
- AC6: Les sitemaps (générés par E5-S03) sont mis à jour pour inclure ces articles publiés.

## Technical Implementation Context

**Guidance:** Utiliser les détails suivants pour l'implémentation. Consulter les fichiers `docs/` liés pour un contexte plus large si nécessaire.

- **Relevant Files:**
  - Files to Modify: Tous les fichiers `.mdx` des articles de lancement (mise à jour du champ `isDraft` dans le frontmatter).
  - Processus: Git (commit, merge), Pipeline CI/CD (GitHub Actions).
  - _(Hint: Voir `docs/project-structure.md`)_

- **Key Technologies:**
  - Git.
  - MDX frontmatter.
  - Le système de CI/CD (ex: GitHub Actions, Docker, Traefik - configuration faite dans Epic 1 et pipeline dans Epic 7).
  - _(Hint: Voir `docs/architecture/tech-stack.md`)_

- **API Interactions / SDK Usage:** Non applicable.

- **UI/UX Notes:** Cette action rend le contenu visible au public. La qualité de ce contenu et son affichage sont primordiaux pour la première impression.

- **Data Structures:** Le champ `isDraft: false` dans le frontmatter.

- **Environment Variables:** Le pipeline de déploiement utilisera les variables d'environnement de production.

- **Coding Standards Notes:**
  - Suivre le workflow Git défini pour le projet (ex: feature branch -> develop -> main).
  - Messages de commit clairs.
  - _(Hint: Voir `docs/contribution/normes-codage.md`)_

## Tasks / Subtasks

- [ ] Effectuer une dernière vérification de tous les articles (contenu, frontmatter, formatage - basé sur E6-C01 à E6-C04).
- [ ] Pour chaque article de lancement :
  - [ ] Modifier le fichier MDX et changer `isDraft: true` en `isDraft: false`.
- [ ] Commiter tous les changements sur une branche de travail (ex: `feature/initial-content-release`).
- [ ] Créer une Pull Request (PR) vers la branche d'intégration (ex: `develop`) ou directement vers `main` selon le workflow.
- [ ] Faire réviser la PR (si le process l'exige).
- [ ] Merger la PR dans la branche principale (`main`).
- [ ] Surveiller l'exécution du pipeline de CI/CD.
- [ ] Une fois le déploiement terminé, vérifier manuellement sur le site de production :
  - [ ] Que tous les 20 articles sont accessibles.
  - [ ] Que les pages de listing sont à jour.
  - [ ] Que les sitemaps contiennent les nouveaux articles.

## Testing Requirements

**Guidance:** Vérifier l'implémentation par rapport aux ACs en utilisant les tests suivants.

- **Validation Post-Déploiement :**
  - **Smoke Test exhaustif du contenu :**
    - Ouvrir chaque article publié (FR et EN) sur le site de production. Vérifier le rendu, l'absence d'erreurs 404, le bon affichage des images et du code.
    - Vérifier que les articles apparaissent dans les listes (blog principal, catégories/piliers).
    - Vérifier que les liens internes dans les articles (si existants) fonctionnent.
    - Vérifier que la navigation linguistique entre les versions traduites des nouveaux articles fonctionne.
  - **Vérification du Sitemap :** Accéder au `sitemap-index.xml` (ou `sitemap-0.xml`) sur le site de production et s'assurer qu'il liste les nouveaux articles.
- **Monitoring CI/CD :**
  - S'assurer que le build et le déploiement se sont déroulés sans erreur dans le pipeline.
- _(Hint: Voir `docs/tests/strategie-tests.md` pour la stratégie globale et les types de tests post-déploiement)_

## Story Wrap Up (Agent Populates After Execution)

- **Agent Model Used:** `<Agent Model Name/Version>`
- **Completion Notes:**
- **Change Log:**
  - Initial Draft