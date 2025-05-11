# Blog Technique Bilingue - Plan de Sécurité

## 1. Introduction et Objectifs

Ce Plan de Sécurité détaille les stratégies, les politiques, les procédures et les contrôles mis en œuvre pour protéger l'application "Blog Technique Bilingue", ses données, et son infrastructure contre les menaces et les vulnérabilités. La sécurité est une considération primordiale à toutes les étapes du cycle de vie du projet, de la conception au déploiement et à la maintenance.

**Objectifs Principaux du Plan de Sécurité :**

* **Confidentialité :** Protéger les informations sensibles (ex: secrets de configuration, données de la base de données même si anonymisées pour le MVP) contre tout accès non autorisé.
* **Intégrité :** Assurer l'exactitude et la complétude des données (contenu du blog, compteurs) et des configurations du système, en empêchant toute modification non autorisée.
* **Disponibilité :** Garantir que le blog et ses fonctionnalités restent accessibles aux utilisateurs légitimes et résistent aux attaques visant à perturber le service (ex: déni de service de base).
* **Conformité :** Respecter les réglementations applicables (ex: RGPD pour la collecte minimale de données et la gestion des cookies/analytics) et les bonnes pratiques de l'industrie.
* **Réponse aux Incidents :** Établir une capacité de base pour détecter, répondre et se remettre des incidents de sécurité.

Ce document sert de référence pour toutes les parties prenantes impliquées dans le développement, le déploiement et la maintenance du blog.

## 2. Portée du Plan de Sécurité

Ce plan de sécurité couvre les aspects suivants du projet "Blog Technique Bilingue" pour sa version MVP :

* **Application Frontend (Astro & Nginx) :** Sécurité des fichiers statiques, configuration du serveur web Nginx, protection contre les attaques XSS de base.
* **Application Backend (Spring Boot API) :** Sécurité des endpoints API (même publics pour le MVP), validation des entrées, gestion des erreurs sécurisée, protection contre les vulnérabilités courantes des applications web.
* **Base de Données (PostgreSQL) :** Sécurisation de l'accès, configuration, intégrité des données de comptage.
* **Infrastructure d'Hébergement (VPS OVH - Debian) :** Sécurisation du système d'exploitation, du réseau (pare-feu), des accès SSH.
* **Conteneurisation (Docker & Docker Compose) :** Sécurisation des images Docker, configuration des conteneurs (utilisateurs non-root), isolation des services.
* **Reverse Proxy (Traefik) :** Terminaison SSL/TLS, gestion des certificats Let's Encrypt, configuration des headers de sécurité, protection contre les attaques de base au niveau du proxy.
* **Pipeline CI/CD (GitHub Actions) :** Sécurisation des workflows, gestion des secrets, analyse de sécurité des dépendances et des images.
* **Processus de Développement :** Bonnes pratiques de codage sécurisé, gestion des dépendances, tests de sécurité.
* **Gestion des Données :** Protection des données de comptage (anonymisées), gestion des variables d'environnement et des secrets.

Les aspects de sécurité plus avancés (ex: tests d'intrusion formels, solutions de SIEM complexes, authentification utilisateur avancée pour des zones d'administration) sont considérés comme Post-MVP mais les fondations posées ici viseront à faciliter leur intégration future.

## 3. Analyse des Menaces et Modélisation des Risques (Simplifiée pour le MVP)

Une analyse formelle des menaces (comme STRIDE) peut être complexe. Pour le MVP, nous adoptons une approche simplifiée pour identifier les menaces et les risques potentiels les plus pertinents pour notre blog technique bilingue.

### 3.1. Actifs à Protéger (MVP)

* **Contenu du Blog (Articles MDX) :** L'intégrité et la disponibilité du contenu sont primordiales.
* **Application Frontend (Site Statique) :** Disponibilité, intégrité (pas de défaçage).
* **Application Backend (API de Métriques) :** Disponibilité, intégrité des compteurs (bien que les données soient anonymes et non critiques pour le MVP, leur corruption serait indésirable).
* **Base de Données (PostgreSQL) :** Disponibilité, intégrité des données de comptage.
* **Infrastructure d'Hébergement (VPS OVH) :** Disponibilité, intégrité, confidentialité des accès.
* **Pipeline CI/CD (GitHub Actions) :** Intégrité du code source, confidentialité des secrets de déploiement.
* **Réputation du Blog :** La confiance des utilisateurs peut être affectée par des incidents de sécurité ou des indisponibilités.

### 3.2. Menaces Potentielles et Vecteurs d'Attaque (MVP)

| Menace / Vulnérabilité Potentielle          | Actif(s) Affecté(s)                                    | Vecteur d'Attaque Possible                                                                                                                               | Probabilité (MVP) | Impact Potentiel (MVP) |
| :------------------------------------------ | :----------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------- | :--------------------- |
| **Attaques sur l'Infrastructure VPS** |                                                        |                                                                                                                                                          |                   |                        |
| Accès non autorisé au VPS (SSH compromis) | Tous                                                   | Faiblesse des mots de passe (si non désactivés), clé SSH compromise, vulnérabilité SSH non patchée.                                                       | Faible à Moyen    | Critique               |
| Attaque par Déni de Service (DoS/DDoS) sur le VPS/Traefik | Disponibilité du Frontend, Backend, Base de Données | Inondation de requêtes (SYN flood, HTTP flood) visant l'IP du VPS ou le service Traefik.                                                                | Moyen             | Élevé                  |
| Exploitation de vulnérabilités OS ou services non patchés | Tous (potentiellement prise de contrôle du VPS)      | Manque de mises à jour de sécurité régulières sur Debian, Docker, Nginx, PostgreSQL, Traefik.                                                            | Moyen             | Critique               |
| **Attaques sur les Applications Web** |                                                        |                                                                                                                                                          |                   |                        |
| (Théorique pour MVP) Cross-Site Scripting (XSS) | Contenu du Blog (si injection via un futur système de commentaires), Réputation | Si des commentaires (Post-MVP) ou d'autres entrées utilisateur étaient mal validés et affichés sans échappement. Pour le MVP, la surface est très limitée. | Faible            | Moyen                  |
| Abus de l'API de Métriques                  | Backend API, Base de Données (compteurs)               | Scripts automatisés envoyant un grand nombre de requêtes POST aux endpoints de partage/feedback, faussant les compteurs ou surchargeant l'API.              | Moyen             | Faible à Moyen         |
| Vulnérabilités des Dépendances (Frontend/Backend) | Frontend, Backend, potentiellement VPS                | Utilisation de bibliothèques Node.js (PNPM) ou Java (Maven) avec des vulnérabilités connues non corrigées.                                                  | Moyen             | Variable (Élevé si critique) |
| Injection SQL (peu probable avec JPA/Spring Data) | Base de Données                                        | Si des requêtes natives étaient mal construites (non applicable avec l'usage standard de Spring Data JPA pour le MVP).                                    | Très Faible       | Élevé                  |
| **Attaques sur le Pipeline CI/CD** |                                                        |                                                                                                                                                          |                   |                        |
| Compromission des Secrets GitHub Actions    | Accès au VPS, Registre d'images Docker (GHCR)          | Fuite des secrets (ex: `VPS_SSH_PRIVATE_KEY`, `GHCR_TOKEN`) due à une mauvaise configuration du workflow ou une vulnérabilité dans une action tierce.         | Faible à Moyen    | Critique               |
| Injection de Code Malveillant dans le Build | Images Docker, Code Déployé                            | Modification malveillante du code source dans une PR, ou utilisation d'une dépendance compromise qui injecte du code pendant le build.                     | Faible            | Critique               |
| **Autres Menaces** |                                                        |                                                                                                                                                          |                   |                        |
| Défaçage du Site (modification non autorisée du contenu statique) | Contenu du Blog, Réputation                            | Accès compromis au VPS permettant de modifier les fichiers servis par Nginx, ou compromission du pipeline de build/déploiement du frontend.                 | Faible            | Moyen                  |
| Perte de Certificats SSL (acme.json)      | Disponibilité (HTTPS)                                  | Suppression accidentelle ou corruption du fichier `acme.json` sans sauvegarde, ou échec du processus de renouvellement automatique.                       | Faible            | Moyen                  |

**Probabilité (MVP) :** Évaluation subjective de la probabilité pour la configuration et la portée du MVP.
**Impact Potentiel (MVP) :** Gravité des conséquences si la menace se matérialise.

### 3.3. Risques Principaux Identifiés pour le MVP

En se basant sur la probabilité et l'impact :

1.  **Exploitation de vulnérabilités logicielles non patchées sur le VPS ou dans les conteneurs :** Impact critique, probabilité moyenne. (Doit être mitigé par une politique de mise à jour rigoureuse).
2.  **Attaque par Déni de Service (DoS/DDoS) de base :** Impact élevé, probabilité moyenne. (Mitigation de base par pare-feu et Traefik, mais des attaques volumétriques importantes peuvent dépasser les capacités d'un VPS unique).
3.  **Compromission des accès SSH au VPS ou des secrets CI/CD :** Impact critique, probabilité faible à moyenne. (Mitigé par l'utilisation de clés SSH, la sécurisation des secrets, et les bonnes pratiques).
4.  **Vulnérabilités dans les dépendances applicatives :** Impact variable (potentiellement élevé), probabilité moyenne. (Mitigé par les scans de dépendances et les mises à jour).
5.  **Abus de l'API de métriques :** Impact faible à moyen sur les données (compteurs), probabilité moyenne. (Peut être mitigé par un rate limiting basique post-MVP).

Cette analyse simplifiée aide à prioriser les mesures de sécurité à mettre en œuvre. Les sections suivantes de ce plan détailleront les contrôles spécifiques pour atténuer ces risques.

## 4. Politiques de Sécurité

Les politiques suivantes définissent les engagements et les règles de base en matière de sécurité pour le projet "Blog Technique Bilingue".

### 4.1. Politique de Gestion des Accès

* **Principe du Moindre Privilège :** Les utilisateurs et les services n'auront que les permissions strictement nécessaires.
* **Accès SSH au VPS :** Authentification par clé SSH uniquement, mots de passe désactivés. `fail2ban` configuré.
* **Secrets GitHub Actions :** Stockés en tant que "Encrypted Secrets".
* **Dashboard Traefik :** Protégé par authentification forte si activé en production.

### 4.2. Politique de Gestion des Vulnérabilités

* **Mises à Jour Régulières :** OS VPS, services clés (Docker, Traefik, etc.) maintenus à jour.
* **Analyse des Dépendances :** Scans réguliers (PNPM Audit, OWASP Dependency-Check) dans CI/CD.
* **Analyse des Images Docker :** Scans avec Trivy dans CI/CD.
* **Veille de Sécurité :** Maintenue pour les technologies de la stack.

### 4.3. Politique de Sécurité du Code et du Développement (Secure SDLC)

* **Bonnes Pratiques de Codage :** Validation des entrées, encodage des sorties, gestion sécurisée des erreurs (voir `docs/contribution/normes-codage.md`).
* **Revue de Code :** PRs revues, accent sur la sécurité.
* **Tests de Sécurité :** Intégrés au CI/CD.
* **Gestion des Secrets en Développement :** Fichiers `.env` locaux non versionnés, `.env.example` versionné.

### 4.4. Politique de Sécurité Réseau

* **Pare-feu VPS (`ufw`) :** Autorise uniquement SSH (port configuré), HTTP (80), HTTPS (443).
* **Isolation des Réseaux Docker :** Réseaux dédiés. PostgreSQL et Backend non exposés directement.
* **HTTPS Strict :** Traefik force HTTPS, utilise Let's Encrypt.
* **Headers de Sécurité HTTP :** Configurés via Traefik (HSTS, CSP, X-Frame-Options, etc.).

### 4.5. Politique de Logging et de Monitoring de Sécurité

* **Collecte des Logs :** Logs d'accès et d'erreur des composants critiques.
* **Revue des Logs de Sécurité :** Revue périodique (`auth.log`, logs Traefik, `fail2ban`).
* **Monitoring de Sécurité (Basique MVP) :** Surveillance des tentatives de connexion SSH échouées.

### 4.6. Politique de Réponse aux Incidents de Sécurité (Simplifiée MVP)

* **Identification et Qualification.**
* **Confinement.**
* **Éradication.**
* **Récupération.**
* **Leçons Apprises.**

## 5. Contrôles de Sécurité Spécifiques par Composant

Cette section détaille les mesures de sécurité techniques et procédurales appliquées à chaque composant majeur.

### 5.1. Infrastructure d'Hébergement (VPS OVH - Debian)

* **Accès SSH :** Clé uniquement, `fail2ban`, port standard ou personnalisé.
* **Système d'Exploitation :** Mises à jour régulières, minimisation des services, `ufw`.
* **Utilisateurs et Permissions :** Utilisateur de déploiement non-root, permissions restrictives sur fichiers sensibles.

### 5.2. Conteneurisation (Docker & Docker Compose)

* **Images Docker Sécurisées :** Images de base officielles minimales, reconstruites régulièrement, scan Trivy.
* **Exécution Utilisateur Non-Root :** `USER nom_utilisateur` dans les `Dockerfile`.
* **Isolation Réseaux Docker :** Réseaux dédiés.
* **Gestion des Volumes :** Clairement définis et sécurisés.

### 5.3. Reverse Proxy (Traefik)

* **Terminaison SSL/TLS :** Let's Encrypt auto-renouvelé, `acme.json` sécurisé.
* **Redirection HTTP vers HTTPS.**
* **Headers de Sécurité HTTP :** HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy.
* **Protection de Base :** (Rate limiting, IP filtering post-MVP).
* **Sécurisation Dashboard Traefik.**

### 5.4. Application Frontend (Astro / Nginx)

* **Service Statique :** Surface d'attaque réduite.
* **Configuration Nginx (Dockerfile) :** Utilisateur non-root, config minimaliste, logs vers `stdout`/`stderr`.
* **Content Security Policy (CSP).**
* **Subresource Integrity (SRI) (Post-MVP).**
* **Dépendances Frontend :** `pnpm audit` dans CI/CD.

### 5.5. Application Backend (Spring Boot API)

* **Sécurité Endpoints API (MVP : publics) :** Validation des entrées (Bean Validation), gestion sécurisée des erreurs.
* **Dépendances Backend :** OWASP Dependency-Check dans CI/CD.
* **Configuration Spring Security (Minimale MVP) :** Incluse pour protections futures. CSRF désactivé si non pertinent. Post-MVP : rate limiting.
* **Communication Base de Données :** Spring Data JPA (protection injections SQL), identifiants DB via variables d'env.

### 5.6. Base de Données (PostgreSQL)

* **Accès Réseau :** Non exposé publiquement, accessible uniquement via réseau Docker interne.
* **Authentification :** Utilisateur applicatif dédié, mot de passe fort.
* **Permissions :** Minimales pour l'utilisateur applicatif.
* **Mises à Jour :** Image Docker maintenue à jour.
* **Sauvegardes :** Gérées par OVH.

### 5.7. Pipeline CI/CD (GitHub Actions)

* **Gestion des Secrets :** "Encrypted Secrets" GitHub Actions.
* **Permissions des Actions :** Minimales.
* **Revue des Actions Tierces :** Versions figées, fournisseurs réputés.
* **Protection des Branches :** `main` et `develop` protégées (vérifications de statut, approbations PR optionnelles MVP).
* **Analyse de Code Statique (SAST) (Post-MVP).**

## 6. Gestion des Incidents de Sécurité (MVP)

Bien que l'objectif principal soit la prévention, une procédure de base pour la gestion des incidents de sécurité est nécessaire.

### 6.1. Détection et Signalement
* Sources : Revues manuelles des logs, alertes `fail2ban`, résultats scans CI/CD, comportement anormal, notifications externes.
* Signalement immédiat au responsable technique.

### 6.2. Procédure de Réponse Initiale (MVP)
1.  **Évaluation et Qualification.**
2.  **Confinement** (Ex: blocage IP, arrêt service, révocation clé).
3.  **Éradication** (Ex: patch vulnérabilité, suppression malware).
4.  **Récupération** (Restaurations, redéploiements).
5.  **Leçons Apprises.**

### 6.3. Contacts d'Urgence
* **Hébergeur (OVH) :** Support technique OVH.
* **Responsable Technique du Projet :** (À définir).

## 7. Révision et Mise à Jour du Plan de Sécurité

Ce Plan de Sécurité est un document vivant.

* **Fréquence de Révision :** Tous les 6 mois, ou suite à incidents/changements majeurs.
* **Processus de Révision :** Réévaluation des menaces, adéquation des contrôles, identification des lacunes.
* **Responsabilité :** Architecte / Responsable technique.

## 8. Change Log

| Date       | Version | Description                                                                                                                                                  | Auteur                            |
| :--------- | :------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------- |
| 2025-05-11 | 0.1     | Création initiale du Plan de Sécurité. Sections incluses : Introduction, Portée, Analyse des Menaces (MVP), Politiques de Sécurité, Contrôles par Composant. | 3 - Architecte (IA) & Utilisateur |
| 2025-05-11 | 0.2     | Ajout des sections Gestion des Incidents de Sécurité (MVP), Révision et Mise à Jour du Plan, et Change Log.                                                  | 3 - Architecte (IA) & Utilisateur |