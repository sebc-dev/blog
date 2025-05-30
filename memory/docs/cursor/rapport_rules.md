## Maîtriser les Règles de Projet : Structure et Configuration

### L'Architecture du Dossier `.cursor/rules`

Le dossier `.cursor/rules` à la racine du projet permet d'inclure les règles dans la gestion de version. Des **règles imbriquées** peuvent être créées dans des sous-dossiers `.cursor/rules/` pour des parties spécifiques du projet (ex: `monProjet/backend/.cursor/rules/`). Ces règles sont automatiquement prises en compte pour les fichiers de leur répertoire parent ou sous-répertoires.

### Anatomie d'une Règle : Fichiers `.mdc` et Métadonnées (Frontmatter)

Chaque règle de projet est un fichier `.mdc` (Markdown Components) combinant des métadonnées YAML (frontmatter) et du contenu Markdown.

**Frontmatter** (délimité par `---`):
* `description`: (Optionnel) Décrit l'objectif de la règle, crucial pour les règles `Agent Requested`.
* `globs`: Tableau de motifs de fichiers (ex: `["**/*.py"]`) pour le déclenchement des règles `Auto Attached`.
* `alwaysApply`: Booléen (`true` pour les règles `Always`).

**Contenu de la règle** (après le frontmatter):
* Rédigé en Markdown.
* Peut inclure instructions, listes, exemples de code.
* Références à d'autres fichiers du projet avec `@chemin/vers/le/fichier.ext`.

Exemple de fichier `.mdc`:
```markdown
---
description: "Directives pour la création de modèles Django"
globs: ["**/models.py"]
alwaysApply: false
---
# Directives pour les modèles Django

- Toujours utiliser `verbose_name` et `verbose_name_plural` pour les classes Meta.
- Les champs `ForeignKey` doivent spécifier `on_delete` et `related_name`.
- Pour un exemple de structure de modèle, voir : @core/base_model_template.py
````

### Les Différents Types de Règles de Projet (.mdc)

| Type                | Métadonnées Clés                                           | Description du Comportement                                                                    | Quand l'utiliser?                                                                                          |
| :------------------ | :--------------------------------------------------------- | :--------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------- |
| **Always** | `alwaysApply: true`                           | Toujours incluse dans le contexte du modèle pour le projet.                               | Standards fondamentaux du projet, directives architecturales de base, préférences de style universelles. |
| **Auto Attached** | `globs: ["pattern"]`, `alwaysApply: false`    | Incluse seulement si des fichiers correspondant au glob sont actifs dans le contexte IA. | Règles spécifiques à des modules, types de fichiers (tests, vues, modèles), ou sections du codebase.   |
| **Agent Requested** | `description: "..."`, `alwaysApply: false`    | L'IA décide de l'utiliser en fonction de la description et du contexte de la conversation. | Directives optionnelles, contraintes pour tâches spécifiques (refactoring), workflows complexes non systématiques. |
| **Manual** | `alwaysApply: false` (ou omis), pas de `description` ou `globs`. | Incluse seulement si explicitement appelée via `@nomDeLaRegle`.                              | Workflows très spécifiques, ensembles de contraintes ponctuels, "jeux de règles" activables à la demande. |

## Création et Génération Efficace des Règles

### Création Manuelle et Commande "New Cursor Rule"

La création manuelle d'un fichier `.mdc` dans `.cursor/rules` est la méthode directe. La commande "New Cursor Rule" via la Palette de Commandes (Cmd+Shift+P ou Ctrl+Shift+P) facilite ce processus en ouvrant un template. On peut aussi y accéder via `Cursor Settings > Rules`.

### Exploiter la Commande `/Generate Cursor Rules` (spécificités v0.49)

Introduite en v0.49, la commande `/Generate Cursor Rules` dans le chat IA transforme une conversation en une ou plusieurs règles de projet. L'IA analyse l'historique de la conversation pour identifier les décisions clés et proposer des brouillons de règles `.mdc`. Cela permet de créer des règles sans quitter le chat et de faire en sorte que l'Agent modifie ou mette à jour le fichier de règles efficacement.

### Approches pour l'Itération et l'Évolution des Règles

  * **Itération Basée sur la Performance :** Affiner continuellement les règles en fonction des résultats de l'IA et de l'évolution des besoins du projet.
  * **Progression Graduelle :** Commencer par des règles utilisateur globales, puis des règles de projet, et enfin scinder en fichiers `.mdc` contextuels plus petits.
  * **Réaction aux Erreurs Répétées :** Créer une nouvelle règle chaque fois que l'IA commet une erreur récurrente.
  * **Utilisation de "Méta-Règles" :** Laisser l'IA aider à écrire les règles elles-mêmes, en utilisant des règles qui instruisent l'IA sur la manière de formater d'autres règles.

## Bonnes Pratiques pour la Rédaction de Règles à Fort Impact

  * **Clarté, Spécificité et Actionnabilité :** Les règles doivent être précises, actionnables et leur portée clairement délimitée. Éviter les conseils vagues.
  * **Conciseness et Longueur Optimale :** Maintenir la longueur d'une règle `.mdc` en dessous de 500 lignes pour optimiser l'utilisation des tokens.
  * **Utilisation d'Exemples Concrets et de Références Contextuelles :** Inclure de courts extraits de code ou référencer des fichiers externes avec `@nom_du_fichier.ext`. Fournir des exemples positifs et négatifs.
  * **Décomposition :** Décomposer les standards complexes en règles plus petites et ciblées. Un fichier = une règle/thème.
  * **Rédiger des Descriptions Pertinentes pour les Règles Agent Requested :** Une description claire, concise et informative est essentielle pour que l'IA sélectionne efficacement la règle.
  * **Checklist de vérification :** Inclure des cases à cocher pour les points critiques.

### Structure optimale d'une règle efficace

1.  Une métadonnée (frontmatter) bien définie avec une description précise.
2.  Un titre clair.
3.  Un contenu principal expliquant la règle.
4.  Des exemples positifs et négatifs pour illustrer les bonnes et mauvaises pratiques.

### Tableau des Symboles @ Clés pour Enrichir le Contexte

| Symbole      | Objectif Principal                                                                        |
| :----------- | :---------------------------------------------------------------------------------------- |
| @Files       | Référencer des fichiers spécifiques du projet.                                             |
| @Folders     | Référencer des répertoires entiers.                                                         |
| @Code        | Pointer vers des extraits de code spécifiques.                                            |
| @Docs        | Référencer de la documentation (pré-indexée ou ajoutée par l'utilisateur via URL).        |
| @CursorRules | Référencer (et activer manuellement) d'autres règles de projet.                           |
| @Notepads    | Accéder à des blocs-notes personnels.                                                      |
| @Git         | Référencer l'historique Git, des commits spécifiques.                                     |
| @Web         | Inclure des informations provenant d'une recherche web.                                     |

## Intégration des Règles avec la Documentation de Projet (PRD, Spécifications)

### Structurer la Documentation pour une Meilleure Assimilation par l'IA

  * **Sections Claires et Cohérentes :** Organiser la PRD avec des titres bien définis.
  * **Listes à Puces :** Utiliser pour les critères d'acceptation ou exigences techniques.
  * **Précision dans les Spécifications Techniques :** Mentionner explicitement frameworks, API, patrons de conception.
  * **Langage Simple et Non Ambigu :** Rédiger clairement, définir les acronymes.
  * **Fichiers Dédiés :** Envisager un fichier `instructions.md`.

### Utiliser @Docs pour Référencer la Documentation

Cursor permet d'accéder à des documentations tierces pré-indexées via `@Docs`. Les utilisateurs peuvent ajouter des documentations personnalisées via `@Docs > Add new doc` en fournissant une URL. Cursor indexe et maintient à jour ces documentations. La gestion se fait via `Cursor Settings > Features > Docs`.

### Incorporer des Éléments de Documentation

  * **Référencement dans les Règles via @Files :** `@chemin/vers/mon_prd.md`.
  * **Référencement dans le Chat via @Files**.
  * **Intégration Directe dans les Règles :** Pour des extraits critiques ou directives concises.

### Intégration avec Pieces pour la mémoire à long terme

Une intégration avec Pieces permet d'accéder à une "mémoire à long terme" depuis le chat Cursor, d'interroger cette mémoire et d'utiliser les réponses pour mettre à jour du code.

## Techniques Avancées et Optimisation des Règles

### Stratégies d'Optimisation du Contenu des Règles

  * **Minimiser les Tokens :** Rédiger des règles compactes et précises.
  * **Utilisation Stratégique des Types de Règles :** Choisir judicieusement pour charger les règles uniquement lorsque nécessaire.
  * **Références vs. Contenu Intégré :** Préférer les références `@fichier` pour les informations volumineuses.
  * **Langage Formel et Structuré :** Utiliser un langage clair et structuré.

### Gestion de la Complexité et Prévention de la Sur-Spécification

  * **Décomposition Rigoureuse :** Diviser les directives complexes en fichiers `.mdc` plus petits et ciblés.
  * **Éviter la Sur-Spécification :** Définir les invariants mais laisser une marge de manœuvre à l'IA.
  * **Priorisation des Règles :** Se concentrer sur les domaines à forte valeur ajoutée.

### Méthodes de Test et de Validation de l'Efficacité des Règles

  * **Observation et Itération Continue :** Observer le comportement de l'IA et itérer sur les règles.
  * **Scénarios de Test Spécifiques :** Préparer des prompts pour solliciter certaines règles.
  * **Utilisation du "YOLO Mode" et des Tests Automatisés :** Laisser l'IA écrire et modifier du code jusqu'à ce que les tests (unitaires, intégration) passent.
  * **Examen des Modifications en Vue Diff :** Vérifier attentivement les propositions de l'IA.
  * **Intégration d'Étapes de Vérification dans les Règles :** Demander à l'IA de vérifier son propre travail.
  * **"Visibility Rules" (Règles de Visibilité) :** Si disponible, voir quelles règles sont appliquées par l'IA.

### Support d'images dans MCP

Cursor v0.49 permet de transmettre des images dans le contexte des serveurs MCP, utile pour les captures d'écran, maquettes ou diagrammes.

## Pièges Courants et Comment les Éviter

| Piège                                                                         | Risque                                                                 | Solution                                                                                                                               |
| :---------------------------------------------------------------------------- | :--------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| **Instructions Vagues ou Ambiguës**                                | Règle ignorée ou mal interprétée par l'IA.                        | Visée la spécificité et l'actionnabilité. Indiquer clairement ce qui est attendu/interdit. Reformuler avec critères vérifiables. |
| **Règles Trop Larges ou Conflictuelles**                             | Instructions conflictuelles, fichier de règles ingérable. IA indécise. | Décomposer en règles plus petites, ciblées et modulaires. Réviser la cohérence. Utiliser la granularité des types de règles et des globs. Harmoniser, hiérarchiser ou fusionner. |
| **Négliger la Maintenance et l'Itération des Règles**                 | Règles obsolètes, IA moins pertinente.                               | Intégrer la revue et mise à jour des règles dans le cycle de vie du projet. Affiner en fonction des retours et performances. Revue périodique, changelog. |
| **Ignorer l'Impact sur les Tokens et la Performance**                 | Dégradation de la qualité des réponses, ralentissement de l'IA. Dilution, dépassement de tokens. | Maintenir la concision. Utiliser stratégiquement les types de règles. Décomposer les règles complexes. Segmenter, supprimer le superflu. |
| **Mauvaise Utilisation des Types de Règles et des Métadonnées**         | Règle `Always` pour un usage spécifique, `description` omise pour `Agent Requested`, globs incorrects. | Compréhension approfondie de chaque type de règle. Choisir et configurer avec soin.                                                |
| **Ne pas Vérifier ce que l'IA Comprend (Manque de Visibilité)**       | Difficulté à déboguer le comportement de l'IA ou l'inefficacité d'une règle. | Utiliser des outils de "visibilité des règles" si disponibles. Tests isolés et scénarios ciblés.                               |
| **Ne pas surveiller l'efficacité**                                      |                                                                        | Générer une nouvelle règle chaque fois que l'IA fait une erreur répétée.                                                        |
| **Ne pas utiliser l'IA pour améliorer les règles**                       |                                                                        | Permettre à l'IA de créer des règles en utilisant des méta-règles pour l'automatisation.                                          |

### Configuration recommandée pour les fichiers .mdc

Pour éviter les problèmes de rendu UI avec les fichiers `.mdc` et assurer une sauvegarde correcte, ajouter aux paramètres VS Code:

```json
"workbench.editorAssociations": { "*.mdc": "default" }
```