# Registre de Preuve de covoiturage

Le registre de preuve de covoiturage est un projet beta.gouv.fr qui a pour but de certifier qu'un covoiturage a bien eu lieu. L'objectif de l'outil est l'incitation des utilisateurs à pratiquer le covoiturage courte distance pour réduire l'auto-solisme et réduire l'emprunte écologique des déplacements courts.

[http://covoiturage.beta.gouv.fr/](http://covoiturage.beta.gouv.fr/)

### Docker Services

An easy way to boot the application on your local machine is by using Docker.
You will need `docker` and `docker-compose`.

| Service         | slug        | ENV              | URL                               | Folder     |
| --------------- | ----------- | ---------------- | --------------------------------- | ---------- |
| Frontend        | `dashboard` | APP_APP_URL      | http://localhost:4200             | /dashboard |
| API             | `api`       | APP_API_URL      | http://localhost:8080             | /api       |
| MongoDB \*      | `mongo`     | APP_MONGO_URL    | mongodb://mongo:mongo@mongo:27017 | -          |
| Redis           | `redis`     | APP_REDIS_URL    | redis://redis:6379                | -          |
| Redis Client    | `arena`     | -                | http://localhost:4567             | -          |
| Postgres        | `postgres`  | APP_POSTGRES_URL | postgresql://postgres:post        | -          |
| Postgres Client | `pgadmin`   | -                | http://localhost:5050             | -          |

- Mongo is being deprecated and will be removed when Postgres migration is complete.

> `docker-compose.yml` is used in `local` environment only

### Installation

1. Clone the repository and `cd` to it
2. `cp api/.env.example api/.env`
3. Edit the `api/.env` file
4. `docker-compose build`
5. `docker-compose run api yarn`
6. `docker-compose run api yarn run build`
7. `docker-compose run dashboard yarn`
   <!-- 8. `docker-compose run worker yarn` -->
8. `docker-compose run api yarn migrate`
9. `docker-compose run api yarn set-permissions`

#### clone ilos locally

Ilos is the _progressive micro-service framework_ behind the application.
You can clone the ilos framework locally to use different branches, tags or contribute. To do so, create the `api/ilos` folder, check the `dev` branch out and run `yarn build`.  
Workspaces are handled properly when `yarn` commands are run from the `/api` folder.

> the current `dev` branch of the application runs on Ilos `dev` branch.

```shell
cd api
git clone https://github.com/betagouv/ilos.git ilos
cd ilos
yarn
yarn run build
cd .. (api/)
yarn
yarn run build
```

### Run the stack

1. `docker-compose up`
2. [Access the dashboard](http://localhost:4200)
3. Connect with one of the following test users:
   - admin with `admin@example.com` / `admin1234`
     <!-- - territory with `territory@example.com` / `admin1234`
   - operator with `operator@example.com` / `admin1234` -->

`Ctrl-C` to kill the process

### Configuration

#### Secrets configuration

For all **secrets**, use the `.env` file which is **NOT COMMITED** to Git.

For none secret values configuring the system, commit the ENV vars in `docker-compose.yml`

For _static_ application configuration (timeout, etc.) edit/add the `.ts` files in each service `config/` folder.

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

<!--
- `yarn migrate` run up migrations
- `yarn migrate:down` run down migrations
- `yarn lint`
- `yarn test` run the tests
-->

- `yarn set-permissions` reset all users' permissions based on their group and role
- `yarn workspace @pdc/... run test`
- `yarn workspace @pdc/... run test:integration`

###### outside the `dashboard` container

- `yarn open:cypress` opens cypress GUI
- `yarn test` runs integration tests with cypress

### API documentation

- [Documentation (French)](https://registre-preuve-de-covoiturage.gitbook.io/produit/)

# License

DINSIC, 2017-2019.

The source code is published under [Apache license 2.0](./LICENSE).
