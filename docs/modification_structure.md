````markdown
# Blog Technique Bilingue – Structure du Projet (**révision deployment-ready**)

Ce document décrit :

1. **L’arborescence du dépôt Git (monorepo)** – inchangée pour la partie code.  
2. **L’arborescence de déploiement sur le VPS OVH** – nouvelle section intégrée selon la stratégie `/srv/docker` proposée.  
3. Les ajustements CI/CD (images pré-construites poussées sur GitHub Container Registry).  

---

## 1. Représentation globale du dépôt (monorepo)

```plaintext
blog-technique-bilingue/
├── .github/
│   └── workflows/
│       ├── build-push.yml       # Build & push images vers GHCR
│       └── deploy.yml           # Déploiement SSH vers le VPS
├── backend/                     # Spring Boot (voir §3)
├── frontend/                    # Astro (voir §3)
├── infra/                       # Fichiers Compose *développement*
│   ├── proxy/                   # Traefik (dev)
│   │   └── docker-compose.yml
│   └── site/                    # Stack Astro + Spring + PostgreSQL (dev)
│       └── docker-compose.yml
├── docs/ …                      # Documentation (inchangé)
├── scripts/ …
├── .editorconfig
├── .env.example
├── .gitignore
└── README.md
````

*Changement majeur :* **le dépôt ne contient plus de `docker-compose.yml` racine « tout-en-un »**.
Chaque stack dispose d’un fichier Compose dédié placé **dans son propre dossier** ; Compose dérive ainsi automatiquement le *project name* à partir du nom du dossier, ce qui évite toute collision de ressources (containers, volumes, réseaux). ([Docker Documentation][1], [Docker Community Forums][2])

---

## 2. Arborescence de déploiement sur le VPS OVH

Les artefacts Docker sont construits par GitHub Actions, poussés sur GHCR puis déployés via SSH dans la structure serveur suivante :

```plaintext
/srv
└── docker
    ├── proxy/                       # ⇢ Traefik (entrée unique 80/443)
    │   ├── docker-compose.yml       # version *production*
    │   ├── .env                     # TRAEFIK_* vars
    │   └── traefik_data/
    │       ├── traefik.yml
    │       └── acme.json            # certs (chmod 600, hors Git)
    ├── apps/
    │   └── site/                    # ⇢ Astro + Spring + PostgreSQL
    │       ├── docker-compose.prod.yml
    │       ├── .env                 # POSTGRES_PASSWORD, etc.
    │       └── data/                # uploads, dumps éventuels
    └── backups/                     # dépôt Restic/Borg (hors Git)
```

*Justification `/srv`* : le FHS réserve ce répertoire aux **données servies par le système** (HTTP, FTP, VCS, etc.) ; placer vos stacks ici respecte la convention et simplifie la sauvegarde. ([Wikipédia][3], [tldp.org][4])

### Réseaux Docker

| Nom            | Type (Docker) | Portée / rôle                                 |
| -------------- | ------------- | --------------------------------------------- |
| `webproxy_net` | *externe*     | Trafic HTTPS entre Traefik et chaque service. |
| `site_net`     | *interne*     | Dialogue Spring ⇄ PostgreSQL (non exposé).    |

---

## 3. Synthèse des modules (back-/front-/infra)

| Module       | Build local ?             | Image push GHCR                | Fichier Compose *prod*                          | Port exposé  |
| ------------ | ------------------------- | ------------------------------ | ----------------------------------------------- | ------------ |
| **Traefik**  | Non (image officielle)    | N/A                            | `/srv/docker/proxy/docker-compose.yml`          | 80/443       |
| **Astro**    | Oui (`astro/Dockerfile`)  | `ghcr.io/org/site-astro:<tag>` | `/srv/docker/apps/site/docker-compose.prod.yml` | interne 8080 |
| **Spring**   | Oui (`spring/Dockerfile`) | `ghcr.io/org/site-api:<tag>`   | idem                                            | interne 8080 |
| **Postgres** | Non (image officielle)    | N/A                            | idem                                            | interne 5432 |

---

## 4. Flux CI/CD (résumé)

1. **Push d’un tag Git `v1.0.3`**
2. **GitHub Actions**

   * *Job build-push* : `docker build`, `docker push` vers GHCR.
   * *Job deploy*    : SSH → VPS ; `docker compose pull && up -d` dans chaque dossier.
3. **Traefik** détecte les nouveaux conteneurs via le provider Docker, émet/renouvelle automatiquement les certificats ACME/TLS-ALPN.

---

## 5. Journal des changements (extrait)

| Date       | Ver. | Nature                                                                                    | Auteur                        |
| ---------- | ---- | ----------------------------------------------------------------------------------------- | ----------------------------- |
| 2025-05-15 | 0.4  | Ajout de la section *Arborescence VPS* et retrait du Compose racine ; adaptation CI GHCR. | Architecte (IA)               |
| 2025-05-11 | 0.3  | MàJ structure `docs/`.                                                                    | Utilisateur                   |
| 2025-05-11 | 0.2  | Package racine backend modifié.                                                           | Architecte (IA) & Utilisateur |
| 2025-05-11 | 0.1  | Version initiale.                                                                         | Architecte (IA)               |

---

**Cette nouvelle version reflète fidèlement la séparation ‘code ↔ infra ↔ données’ et l’utilisation d’images pré-construites hébergées sur GitHub Container Registry.**

```
::contentReference[oaicite:2]{index=2}
```

[1]: https://docs.docker.com/compose/how-tos/project-name/?utm_source=chatgpt.com "Specify a project name - Docker Docs"
[2]: https://forums.docker.com/t/docker-compose-folder-name-caused-me-much-trouble/135372?utm_source=chatgpt.com "Docker compose folder name caused me much trouble - General"
[3]: https://en.wikipedia.org/wiki/Filesystem_Hierarchy_Standard?utm_source=chatgpt.com "Filesystem Hierarchy Standard"
[4]: https://tldp.org/LDP/Linux-Filesystem-Hierarchy/html/srv.html?utm_source=chatgpt.com "/srv"
