![Registre de preuve de covoiturage](https://covoiturage.beta.gouv.fr/images/rpc-large.png)

Le registre de preuve de covoiturage est un projet [beta.gouv.fr](https://beta.gouv.fr) qui a pour but de certifier qu'un covoiturage a bien eu lieu. L'objectif de l'outil est d'agir en tant que tiers de confiance entre les différents acteurs du covoiturage (opérateurs, autorités organisatrices de mobilité, entreprises, régions, etc.) pour simplifier la mise en place d'incitations à destination des covoitureuses et covoitureurs. Cette Startup d'État a pour objectif d'aider à réduire l'auto-solisme et l'emprunte écologique des déplacements courts.

- Plus d'informations sur le [registre de preuve de covoiturage](https://covoiturage.beta.gouv.fr/)
- [Documentation générale](https://doc.covoiturage.beta.gouv.fr)
- [Documentation technique](https://tech.covoiturage.beta.gouv.fr)
- [Statistiques publiques](https://app.covoiturage.beta.gouv.fr/stats)
- [Dépôt du site vitrine](https://github.com/betagouv/preuve-covoiturage-vitrine)
- [Dépôt de l'application](https://github.com/betagouv/preuve-covoiturage)
- [Dépôt de l'infrastructure](https://github.com/betagouv/preuve-covoiturage-infra)
- [Dépôt de l'observatoire](https://github.com/betagouv/observatoire-covoiturage)

### Services

An easy way to boot the application on your local machine is by using Docker.
You will need `docker` and `docker-compose`.

| Service     | slug       | ENV               | URL                        | Folder     |
| ----------- | ---------- | ----------------- | -------------------------- | ---------- |
| Frontend \* | `-`        | APP_APP_URL       | http://localhost:4200      | /dashboard |
| API         | `api`      | APP_API_URL       | http://localhost:8080      | /api       |
| Redis       | `redis`    | APP_REDIS_URL     | redis://redis:6379         | -          |
| Postgres    | `postgres` | APP_POSTGRES_URL  | postgresql://postgres:post | -          |
| Mailhog     | `mailer`   | APP_MAIL_SMTP_URL | http://localhost:8025      | -          |
| S3          | `s3`       | AWS\_\*           | http://localhost:9000      | -          |

> ⚠️ `docker-compose.yml` is used in `local` environment only

### Installation

1. Clone the repository and `cd` to it
2. `cp api/.env.example api/.env`
3. Edit the `api/.env` file
4. `docker-compose build`
5. `./rebuild.sh`
6. `docker-compose run --rm migrator yarn migrate`

```shell
terminal 1: docker-compose up api
terminal 2: docker-compose up dashboard
# nav to http://localhost:4200
```

### Migrations

```shell
// use SKIP_GEO_MIGRATIONS=true to skip geo migrations 
// use SKIP_SQL_MIGRATIONS=true to skip sql migrations

cd api
yarn migrate
// OR
docker-compose run api yarn migrate
```

### Frontend testing

```shell
# default browser is Chrome
yarn test
yarn test --browsers ChromeHeadless
CHROME_BIN=$(which chrome) yarn test
CHROME_BIN=$(which chromium) yarn test
CHROME_BIN=$(which brave-browser) yarn test

# requires karma-firefox-launcher (installed)
yarn test --browsers Firefox
```

### End-to-end testing

```shell
# standalone e2e (running in CI)
./tool.sh e2e
```

```shell
# local e2e
./tool.sh bootstrap
./tool.sh local_e2e
```

##### Notes

- You can monitor your development inbox at http://localhost:8025. Emails are usually cleared in the tests.
- Tests are not stateless yet. You might need to clean up data manually when they crash.

### Configuration

#### Secrets configuration

For all **secrets**, use the `.env` file which is **NOT COMMITED** to Git.

For none secret values configuring the system, commit the ENV vars in `docker-compose.yml`

For _static_ application configuration (timeout, etc.) edit/add the `.ts` files in each service `config/` folder.

### Versions

The project follows the [semver](https://semver.org/) specification.

# License

DINUM, 2017-2023.

The source code is published under [Apache license 2.0](./LICENSE).
