# Règles de Cursor IDE v0.49 – Guide Complet (Version intégralement en français)

> **Note :** Les termes techniques ou noms propres (p. ex. *Cursor Rules*, *Always*, *Auto Attached*, *PRD*, *globs*, etc.) sont volontairement conservés en anglais pour respecter leur usage officiel.

---

## Introduction

Ce guide couvre en détail les **Cursor Rules** de Cursor IDE v0.49 et explique comment les utiliser pour optimiser la qualité du code généré ainsi que la gestion de projet. Nous abordons :

1. les fondements des règles Cursor ;
2. la maîtrise des règles de projet ;
3. la création et la génération efficaces de règles ;
4. les bonnes pratiques pour rédiger des règles percutantes ;
5. l’intégration des règles avec la documentation de projet ;
6. les techniques avancées d’optimisation ;
7. les pièges courants et la façon de les éviter.

Chaque section fournit des explications claires, des exemples concrets en Markdown, des listes de contrôle et des comparatifs utiles. Les références aux sources d’origine sont indiquées sous la forme `【source†Lxx-Lyy】`.

---

## 1. Fondations des *Cursor Rules*

Les **Cursor Rules** sont des directives persistantes données à l’agent IA de Cursor afin d’orienter son comportement tout au long d’un projet. On peut les considérer comme un *prompt système* permanent : leur contenu est injecté au début du contexte envoyé au modèle à chaque requête, garantissant ainsi que l’IA se souvient en continu des conventions, contraintes et objectifs du projet.

Cursor v0.49 prend en charge trois catégories :

| Catégorie                             | Localisation                  | Portée                                                                          |
| ------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------- |
| **Project Rules**                     | `.cursor/rules/*.mdc`         | Propres au dépôt Git ; versionnées, partagées entre tous les membres du projet. |
| **User Rules**                        | Paramètres utilisateur Cursor | Valables sur tous les projets ouverts par l’utilisateur.                        |
| **Fichier `.cursorrules`** (obsolète) | Racine du projet              | Ancien format, toujours lu pour compatibilité, mais remplacé par `.mdc`.        |

Les *Cursor Rules* compensent l’absence de mémoire longue durée des LLM : toute instruction placée dans une règle est systématiquement rappelée à l’IA, contrairement aux messages éphémères du chat.

---

## 2. Maîtrise des règles de projet

### 2.1. Structure du dossier `.cursor/rules`

* Un dossier `.cursor/rules` est placé à la racine du dépôt.
* Des sous-dossiers sont possibles pour scoper les règles (utile en monorepo).
* Chaque règle est un fichier `nom-de-la-regle.mdc`.

### 2.2. Anatomie d’un fichier `.mdc`

```md
---
description: Internal RPC service boilerplate   # résumé clair
globs: services/**/*.ts                         # motifs de fichiers ciblés
alwaysApply: false                              # true = Always rule
---
- Utiliser le patron RPC interne pour tout nouveau service.
- Nommer les services en snake_case.

@service-template.ts
```

* **Front-matter YAML** : `description`, `globs`, `alwaysApply`.
* **Contenu Markdown** : directives, listes, exemples ; références de fichiers préfixées par `@`.

### 2.3. Types de règles de projet

| Type                | Activation                                   | Cas d’usage principal                                   | Points clés                                      |
| ------------------- | -------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------ |
| **Always**          | Toujours                                     | Standards globaux (sécurité, style)                     | Injectée à chaque prompt.                        |
| **Auto Attached**   | Automatique si les fichiers matchent `globs` | Règles modulaires ciblées (monorepo, techno spécifique) | Charge uniquement si pertinent.                  |
| **Agent Requested** | L’IA décide via `description`                | Directives conditionnelles                              | Importance capitale d’une description explicite. |
| **Manual**          | Sur mention `@NomDeLaRègle`                  | Workflows ponctuels                                     | Contrôle 100 % utilisateur.                      |

### 2.4. Meilleures pratiques d’organisation

* Un fichier = une règle/thème.
* Hiérarchie de dossiers pour séparer `frontend`, `backend`, etc.
* Versionnement Git ⇒ partage automatique des règles.

---

## 3. Création et génération efficaces de règles

### 3.1. Méthode manuelle

1. Palette de commandes → **New Cursor Rule** → fichier `.mdc`.
2. Remplir le YAML, rédiger les directives claires (voir Section 4).

### 3.2. Génération automatique avec `/Generate Cursor Rules`

* Analyse la conversation en cours.
* Produit un ou plusieurs fichiers `.mdc` synthétisant les décisions prises.
* Idéal pour formaliser des instructions récurrentes sans les réécrire.

### 3.3. Stratégie d’itération continue

> **Principe :** à chaque erreur répétée de l’IA, créer ou ajuster une règle dédiée.

* Commencer par quelques *Always* et *Auto Attached* essentiels.
* Utiliser l’IA pour aider à formuler ou simplifier les règles (*meta-rules*).
* Garder un changelog des règles pour la maintenance.

---

## 4. Bonnes pratiques pour des règles à fort impact

1. **Clarté** : phrases impératives, termes précis.
2. **Concision** : viser < 500 lignes ; éviter les redondances.
3. **Modularité** : une règle = un thème ; faciliter la composition.
4. **Exemples concrets** : code en Markdown, références `@fichier`.
5. **Contre-exemples** : préciser les anti-patterns à bannir.
6. **Checklist de vérification** : cases à cocher pour les points critiques.
7. **Tonalité cohérente** : aligner User Rules et Project Rules.
8. **Références externes** : pointer vers `@Docs` ou `@README.md` plutôt que tout copier.

> **Exemple bref :**

```md
---
description: React Component Standards
globs: src/components/**/*.tsx
alwaysApply: true
---

Les composants React doivent :
1. Être des *functional components* en TypeScript.
2. Définir une interface `Props` au-dessus du composant.
3. Exporter via *named export*.
```

---

## 5. Intégration avec la documentation de projet

| Bonne pratique                                             | Bénéfice pour l’IA                              |
| ---------------------------------------------------------- | ----------------------------------------------- |
| **PRD structuré** (titres, listes, critères d’acceptation) | Facilité de repérage des exigences              |
| **Versionner docs avec le code**                           | *Digital twin* toujours à jour                  |
| **Fonction `@Docs`** pour docs externes                    | Accès direct de l’IA aux ressources (API, wiki) |
| **Références croisées** dans les règles (`@PRD.md`)        | Lien explicite entre règles et besoins          |
| **Synchronisation règles ↔ docs**                          | Éviter directives obsolètes ou contradictoires  |

---

## 6. Techniques avancées d’optimisation

* **Économie de tokens** : privilégier les références `@fichier` pour les gros blocs ; éviter `alwaysApply` sur les règles volumineuses.
* **Tests** : simuler des requêtes, vérifier le respect des règles ; exploiter l’affichage des *context pills*.
* **Débogage** : valider `description`, `globs`, syntaxe YAML ; tester la règle en `Manual` en cas de doute.
* **Équilibrage contenu / références** : inclure l’essentiel dans la règle, déléguer le détail aux fichiers référencés.
* **Adaptation au modèle** : simplifier la formulation pour les modèles moins puissants si nécessaire.

---

## 7. Pièges courants et comment les éviter

| Piège                    | Risque                           | Solution                                          |
| ------------------------ | -------------------------------- | ------------------------------------------------- |
| **Ambiguïté**            | Règle ignorée ou mal interprétée | Reformuler avec critères vérifiables.             |
| **Surcontexte**          | Dilution, dépassement de tokens  | Segmenter, supprimer le superflu.                 |
| **Conflits**             | IA indécise                      | Harmoniser, hiérarchiser ou fusionner les règles. |
| **Règles obsolètes**     | Code généré dépassé              | Revue périodique, changelog.                      |
| **Dépendance excessive** | Manque de rappel contextuel      | Combiner règles + prompt utilisateur.             |

---

## Conclusion

En appliquant ces bonnes pratiques, vous transformez vos **Cursor Rules** en une mémoire institutionnelle fiable : l’IA produit un code cohérent avec vos standards, respecte vos processus projet et reste alignée sur les exigences métier. Maintenez vos règles à jour, testez-les régulièrement et faites-les évoluer avec le projet pour en tirer tout le potentiel.

---

### Références principales

* Documentation officielle *Cursor Rules* (docs.cursor.com)
* Changelog Cursor v0.49 – génération automatique de règles
* Retours d’expérience communauté Cursor, Trigger.dev, Medium, Forum Cursor

*(Les références numérotées renvoient aux passages cités dans le texte.)*


