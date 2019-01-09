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

### API documentation

_coming soon ;)_

