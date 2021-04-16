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

| Service     | slug       | ENV              | URL                        | Folder     |
| ----------- | ---------- | ---------------- | -------------------------- | ---------- |
| Frontend \* | `-`        | APP_APP_URL      | http://localhost:4200      | /dashboard |
| API         | `api`      | APP_API_URL      | http://localhost:8080      | /api       |
| Redis       | `redis`    | APP_REDIS_URL    | redis://redis:6379         | -          |
| Postgres    | `postgres` | APP_POSTGRES_URL | postgresql://postgres:post | -          |

> \* The Frontend doesn't run in Docker. Install NodeJS locally and run it with `yarn start` from the `dashboard` folder.  
> ⚠️ `docker-compose.yml` is used in `local` environment only

### Installation

1. Clone the repository and `cd` to it
2. `cp api/.env.example api/.env`
3. Edit the `api/.env` file
4. `docker-compose build`
5. `./rebuild.sh`
6. `docker-compose run api yarn migrate`
7. `docker-compose run api yarn set-permissions`

### Migrations

```
// use SKIP_MIGRATIONS=true to skip migrations in an automated deployment process

cd api
yarn migrate
// OR
docker-compose run api yarn migrate
```

### Configuration

#### Secrets configuration

For all **secrets**, use the `.env` file which is **NOT COMMITED** to Git.

For none secret values configuring the system, commit the ENV vars in `docker-compose.yml`

For _static_ application configuration (timeout, etc.) edit/add the `.ts` files in each service `config/` folder.

### Versions

The project follows the [semver](https://semver.org/) specification.

# License

DINUM, 2017-2021.

The source code is published under [Apache license 2.0](./LICENSE).
