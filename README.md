# Preuve de covoiturage

Preuve de covoiturage est un projet beta.gouv.fr qui a pour but de certifier
qu'un covoiturage a bien eu lieu. L'objectif de l'outil est l'incitation des
utilisateurs à pratiquer le covoiturage courte distance pour réduire
l'auto-solisme et réduire l'emprunte écologique des déplacements courts.

[http://covoiturage.beta.gouv.fr/](http://covoiturage.beta.gouv.fr/)

### Requirements

- `docker` && `docker-compose`
- `make`

### Sub-repositories

The API and Dashboard repositories are separated from the main one. Running `make install`
will clone them both at the right place.

The general documentation will be consolidated here. Issues arecreated on the corresponding repos

- Dashboard: [repo](https://github.com/betagouv/preuve-covoiturage-dashboard), [issues](https://github.com/betagouv/preuve-covoiturage-dashboard/issues)
- API : [repo](https://github.com/betagouv/preuve-covoiturage-api), [issues](https://github.com/betagouv/preuve-covoiturage-api/issues)

### Architecture

| Service         | slug       | URL                         | Folder         | Port          |
|-----------------|------------|-----------------------------|----------------|---------------|
| MongoDB         | `mongo`    | mongodb://mongo:27017       | -              | 27017         |
| Redis           | `redis`    | http://localhost:6379       | -              | 6379          |
| Arena (bg jobs) | `arena`    | http://localhost:8080/arena | -              | 8080          |
| API             | `api`      | http://localhost:8080       | /back-api      | 8080          |
| OpenAPI Editor  | `editor`   | http://localhost:8081       | -              | 8081          |
| Dashboard       | `dash`     | http://localhost:4200       | /dashboard     | 4200          |

### Installation

1. Clone the repository and `cd` to it
2. Run `make install` to setup all dependencies on all microservices

### Configuration

#### Secrets configuration

For all **secrets**, use the `.env` file which is **NOT COMMITED** to Git.

For none secret values configuring the system, commit the ENV vars in `docker-compose.yml`

For _static_ application configuration (INSEE codes, timeout, etc.) edit/add the `.yml` files in `config/` folder.

```js
// relative path depends on the location of your file
const config = require("../../packages/config");
console.log(config.camelCasedFileName);
```

### Development workflow

1. Run `docker-compose up api` to start the backend
2. Run `docker-compose up dashboard` to start the dashboard

`Ctrl-C` to kill the process


### CLI commands

##### inside the `api` container

- `yarn seed` Seed the database (based on the NODE_ENV var)
- `yarn process {?safe_journey_id}` re-process a safe-journey to a journey
- `yarn process-trip {?journey_id}` re-process a journey to consolidate trips
- `yarn migrate` run up migrations
- `yarn lint`
- `yarn test` run the tests

##### outside the `api` container

- `yarn mig:up` run up migrations
- `yarn mig:down` run down migrations
- `yarn mig:status` show the migrations status
- `yarn docker-test` run unit and functional tests
- `yarn docker-test-unit` run unit tests
- `yarn docker-test-func` run functional tests

### API documentation

- [Documentation (French)](https://registre-preuve-de-covoiturage.gitbook.io/produit/)
- [OpenAPI documentation](https://api-staging.covoiturage.beta.gouv.fr/openapi/)
