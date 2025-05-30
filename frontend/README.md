# Astro + [Vitest](https://vitest.dev/) Example

```sh
pnpm create astro@latest -- --template with-vitest
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/with-vitest)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/with-vitest)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/with-vitest/devcontainer.json)

This example showcases Astro working with [Vitest](https://vitest.dev/).

## Configuration des variables d'environnement

Pour configurer correctement l'application, créez un fichier `.env` à la racine du projet frontend avec les variables suivantes :

```env
# URL de base du site pour les URLs canoniques
SITE_URL=https://votresite.com

# Pour le développement local, vous pouvez utiliser :
# SITE_URL=http://localhost:4321
```

### Variables disponibles :

- `SITE_URL` : URL de base du site utilisée pour générer les URLs canoniques et les métadonnées. Cette variable est obligatoire en production.
