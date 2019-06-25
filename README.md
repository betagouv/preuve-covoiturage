# Registre de Preuve de covoiturage

Le registre de preuve de covoiturage est un projet beta.gouv.fr qui a pour but de certifier
qu'un covoiturage a bien eu lieu. L'objectif de l'outil est l'incitation des
utilisateurs à pratiquer le covoiturage courte distance pour réduire
l'auto-solisme et réduire l'emprunte écologique des déplacements courts.

[http://covoiturage.beta.gouv.fr/](http://covoiturage.beta.gouv.fr/)

## Contribution à la liste des cartes de transport et des Titres-Mobilité

Les listes des cartes de transport et des Titres-Mobilité autorisés sont disponibles dans la configuration. Il est possible de soumettre des _Pull Requests_ pour en ajouter.

- [Cartes de transport](api/config/travel-pass.yml)
- [Titres-Mobilité](api/config/mobility-pass.yml)

> Merci d'utiliser le modèle de _Pull Request_ quand vous soumettez des modifications.

Merci pour votre contribution !

### Requirements

- `docker` && `docker-compose`

### Architecture

| Service         | slug     | URL                         | Folder     | Port  |
| --------------- | -------- | --------------------------- | ---------- | ----- |
| MongoDB         | `mongo`  | mongodb://mongo:27017       | -          | 27017 |
| Redis           | `redis`  | http://localhost:6379       | -          | 6379  |
| Arena (bg jobs) | `arena`  | http://localhost:8080/arena | -          | 8080  |
| API             | `api`    | http://localhost:8080       | /api       | 8080  |
| OpenAPI Editor  | `editor` | http://localhost:8081       | -          | 8081  |
| Dashboard       | `dash`   | http://localhost:4200       | /dashboard | 4200  |

### Installation

1. Clone the repository and `cd` to it
2. `cp .env.example .env`
3. Edit the `.env` file
4. `docker-compose build`
5. `docker-compose run api yarn`
6. `docker-compose run dashboard yarn`
7. `docker-compose run worker yarn`
8. `docker-compose run api yarn migrate`
9. `docker-compose run api yarn seed`
   `

### Run the stack

1. `docker-compose up`
2. [Access the dashboard](http://localhost:4200)
3. Connect with one of the following test users:
   - admin with `admin@example.com` / `admin1234`
   - aom with `aom@example.com` / `aom1234`
   - operator with `operator@example.com` / `operator`

`Ctrl-C` to kill the process

### Configuration

#### Secrets configuration

For all **secrets**, use the `.env` file which is **NOT COMMITED** to Git.

For none secret values configuring the system, commit the ENV vars in `docker-compose.yml`

For _static_ application configuration (INSEE codes, timeout, etc.) edit/add the `.yml` files in `config/` folder.

```js
// relative path depends on the location of your file
const config = require('../../packages/config');
console.log(config.camelCasedFileName);
```

### Access the database in the docker container

To access the MongoDB instance, you must start the container first and then
enter it to access the mongo shell.

1. `(local)$ docker-compose up -d mongo`
2. `(local)$ docker-compose exec mongo bash`
3. `(docker)$ mongo -u mongo -p mongo`
4. `(mongo shell)> use pdc-local`

If you have mongo shell or a GUI like Compass, you can connect directly to
the server on port 27017:

1. `(local)$ mongo -u mongo -p mongo --host localhost:27017 --authenticationDatabase=admin`

#### import / export mongo database

```bash
# export the database to a compressed archive
$ docker-compose exec mongo mongodump -u mongo -p mongo \
    --db=pdc-local \
    --authenticationDatabase=admin \
    --gzip \
    --archive=/data/db/exports/mongodump-$(date +%Y%m%d%H%M%S).archive.gz

# import an exports archive to 'pdc-local' database
$ docker-compose exec mongo mongorestore -u mongo -p mongo \
    --drop \
    --gzip \
    --nsFrom="pdc-api-staging-1234.*" \
    --nsTo="pdc-local.*" \
    --archive=/data/db/imports/mongodump-20190510084207.archive.gz
```

### CLI commands

##### inside the `api` container

- `yarn seed` Seed the database (based on the NODE_ENV var)
- `yarn process {?safe_journey_id}` re-process a safe-journey to a journey
- `yarn process-trip {?journey_id}` re-process a journey to consolidate trips
- `yarn migrate` run up migrations
- `yarn lint`
- `yarn test` run the tests

- `yarn workspace @pdc/... run test`
- `yarn workspace @pdc/... run test:integration`

### API documentation

- [Documentation (French)](https://registre-preuve-de-covoiturage.gitbook.io/produit/)
- [OpenAPI documentation](https://api-staging.covoiturage.beta.gouv.fr/openapi/)

# License

DINSIC, 2017-2019.

The source code is published under [Apache license 2.0](./LICENSE).
