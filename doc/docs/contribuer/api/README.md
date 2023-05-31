# API

## Introduction

Le Registre de preuve de covoiturage a un client frontend (l'application) et un backend (API).

L'API répond à des requêtes HTTP par du contenu au format JSON. Elle ne possède pas d'interface graphique. Cette fonctionnalité est assurée par l'application.

> L'API n'a pas vocation a être utilisée publiquement.

Construite autour de plusieurs services, organisés autour des besoins métier de l'application, l'API aggrège, vérifie, traite et stocke les données du Registre. Elle assure l'authentification des utilisateurs et les permissions d'accès aux données.

Des processus synchrones, différés et programmés sont gérés par l'API. Elle est connectée à différents [services extérieurs](#services-externes) pour collecter ou vérifier des informations.

## Technologies

| domaine           | technologie   | lien                                                                                     |
| ----------------- | ------------- | ---------------------------------------------------------------------------------------- |
| code              | Typescript    | [https://www.typescriptlang.org/](https://www.typescriptlang.org/)                       |
| runtime           | NodeJS        | [https://nodejs.dev/](https://nodejs.dev/)                                               |
| bdd relationnelle | PostgreSQL    | [https://www.postgresql.org/](https://www.postgresql.org/)                               |
| bdd key-value     | Redis         | [https://redis.io/](https://redis.io/)                                                   |
| format de données | JSON-RPC      | [https://www.jsonrpc.org/](https://www.jsonrpc.org/specification)                        |
| validation        | JSON Schema   | [https://json-schema.org/specification.html](https://json-schema.org/specification.html) |
| authentification  | JWT           | [https://tools.ietf.org/html/rfc7519](https://tools.ietf.org/html/rfc7519)               |
| infra locale      | Docker        | [https://www.docker.com/](https://www.docker.com/)                                       |
| infra de prod     | Kubernetes \* | [https://kubernetes.io/fr/](https://kubernetes.io/fr/)                                   |

> \* en cours de développement

## Concepts

L'API est basée sur le framework de micro-services adaptatif _Ilos_. Ce framework permet de séparer facilement les différentes composants de l'application sans forcément les séparer dans des containers ou des machines différentes. La répartition _physique_ des service peut évoluer en fonction des besoins de performance et de la maitrise des coûts.

Aujourd'hui, l'application est déployée sous forme de monolithe. Tous ses services fonctionnent sur la même machine.

_Ilos_ est basé sur un **Kernel** qui enregistre les **services** de l'application. Toute communication entre **service** passe par le **Kernel**.

Le format d'échange est [JSON-RPC v2.0](https://www.jsonrpc.org/specification). Ce format permet une grande flexibilité puisque le nombre de _méthodes_ est infini et la structure des _paramètres_ est libre.

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "service:action",
  "params": {}
}
```

Les **services** ont un catalogue d'**actions** qui effectuent différentes tâches sur la base de données, l'envoi d'un message, un calcul particulier, etc. Ces **actions** utilisent des **providers** pour communiquer avec la base de données.

> Dans le modèle MVC, les **actions** sont des _contrôleurs_ et les **providers** sont des _modèles_.

Les **providers globaux** peuvent être injectés dans les **providers** des **services** et exposent des fonctionnalités précises (crypto, gestion de fichier, API externe, ...).

Le tout est exposé et protégé par le **proxy** qui accepte les requêtes HTTP de l'extérieur, valide l'authentification des utilisateurs et dirige les requêtes au bon endroit.

La route `POST /rpc` permet d'envoyer des requêtes au format RPC directement aux services. Le client frontend utilise cette route pour toutes ses requêtes authentifiées.

Les requêtes _publiques_ (non authentifiées) sont décrites manuellement dans le fichier `HttpTransport.ts` du proxy au format REST.  
Cette approche permet une grande flexibilité et un contrôle précis des données.

## Arborescence

```shell
api/
├─ db/                # PostgreSQL migrations
├─ ilos/              # ilos packages
├─ node_modules/
├─ providers/         # global providers
├─ proxy/             # HTTP reverse proxy
├─ scalingo/          # Scalingo specific scripts
├─ services/          # api micro-services
├─ .env               # local env vars configuration
├─ .env.example
├─ .gitignore
├─ lerna.json         # lerna.js configuration
├─ mocha-ts.json      # test suite config (legacy)
├─ package.json       # js packages
├─ Procfile           # Scalingo containers' definitions
├─ rebuild.sh         # local tool to rebuild the whole project
├─ tsconfig.json      # tsc global config
├─ package-lock.json
```

## Hébergement

- L'API est hébergée chez Scalingo
- L'app est hébergée chez Alwaysdata

La nouvelle version sera en Kubernetes. Voir [l'infrastructure](/api/infra.html) pour plus de détails.

Les environnements sont :

- Production : [https://api.covoiturage.beta.gouv.fr](https://api.covoiturage.beta.gouv.fr)
- Démo : [https://api.demo.covoiturage.beta.gouv.fr](https://api.demo.covoiturage.beta.gouv.fr)
- Développement : [https://api.dev.covoiturage.beta.gouv.fr](https://api.dev.covoiturage.beta.gouv.fr)

## Services externes

API publiques de l'Etat

- [API entreprise](https://entreprise.api.gouv.fr/)
- [API Géo](https://geo.api.gouv.fr/)
- [Base adresse nationale](https://adresse.data.gouv.fr/)
- [Plateforme ouverte des données publiques françaises (data.gouv)](https://www.data.gouv.fr/fr/)

Services tierces

- [Sendinblue](https://www.sendinblue.com/)
- [OSRM](http://project-osrm.org/) _(auto hébergé)_
- [Komoot Photon](https://photon.komoot.io/)
- [Sentry](https://sentry.io/) _(auto hébergé)_
- [Scaleway](https://www.scaleway.com/)
- [Alwaysdata](https://www.alwaysdata.com/fr/)
- [Scalingo](https://scalingo.com/)
- [OpenStreetMap](https://www.openstreetmap.org/)

## Licences

[Liste complète](/api/licenses-list.html) des licences des dépendances utilisées par l'API.
