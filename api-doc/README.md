# RPC tech documentation

Documentation technique du Registre de preuve de covoiturage.

## Développement

```shell
git clone ...
cd api-doc
yarn
yarn dev
```

## Génération de la documentation

La documentation des services et des providers est générée à partir des commentaires extraits directement du code de l'API.

```shell
yarn gen
```

## Déploiement

```shell
yarn build
```

Licence Apache-2.0 - DINUM 2021
