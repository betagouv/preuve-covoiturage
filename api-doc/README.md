# RPC tech documentation

Documentation technique du Registre de preuve de covoiturage publiée sur [https://tech.covoiturage.beta.gouv.fr](https://tech.covoiturage.beta.gouv.fr).

- Application frontend
- API

## Développement

```shell
git clone ...
cd api-doc
yarn
yarn dev
# browse to http://localhost:8080
```

## Génération de la documentation

La documentation des services et des providers est générée à partir des commentaires extraits directement du code de l'API.

Les fichiers `README.md` des différents services et providers sont récupérés et les commentaires en tête des fichiers `*Action.ts` sont utilisés pour lister les actions à la suite.

```shell
yarn gen
```

## Build

```shell
yarn build
```

## Déploiement

Le déploiement est automatisé via [Github Actions](https://github.com/betagouv/preuve-covoiturage/actions). Le site est publié directement sur [https://tech.covoiturage.beta.gouv.fr](https://tech.covoiturage.beta.gouv.fr).

## License

License Apache-2.0 - © DINUM 2021
