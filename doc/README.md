# RPC tech documentation

Documentation technique du Registre de preuve de covoiturage publiée sur [https://tech.covoiturage.beta.gouv.fr](https://tech.covoiturage.beta.gouv.fr).

- Application frontend
- API

## Développement

```shell
git clone ...
cd doc
npm install
npm run dev
# browse to http://localhost:8080
```

## Documentation OpenAPI

L'interface OpenAPI dans les pages V3, V2 et CEE est générée par le plugin `openapi` de VuePress.

Les fichiers à modifiers sont dans le dossier `.vuepress/public/specs/`.

## Génération de la documentation

La documentation des services et des providers est générée à partir des commentaires extraits directement du code de l'API.

Les fichiers `README.md` des différents services et providers sont récupérés et les commentaires en tête des fichiers `*Action.ts` sont utilisés pour lister les actions à la suite.

```shell
npm run gen
```

## Build

```shell
npm run build
```

## Déploiement

Le déploiement est automatisé via [Github Actions](https://github.com/betagouv/preuve-covoiturage/actions). Le site est publié directement sur [https://tech.covoiturage.beta.gouv.fr](https://tech.covoiturage.beta.gouv.fr).

## License

License Apache-2.0 - © DINUM 2024
