# Preuve de covoiturage

Preuve de covoiturage est un projet beta.gouv.fr qui a pour but de certifier
qu'un covoiturage a bien eu lieu. L'objectif de l'outil est l'incitation des
utilisateurs à pratiquer le covoiturage courte distance pour réduire
l'auto-solisme et réduire l'emprunte écologique des déplacements courts.

### Requirements

- `docker` && `docker-compose`
- `make`

### Architecture

We're trying to split up services as much as possible.

| Service        | slug       | URL                   | Folder         | Port          |
|----------------|------------|-----------------------|----------------|---------------|
| MongoDB        | `mongo`    | mongodb://mongo:27017 | -              | 27017         |
| API            | `api`      | http://localhost:8080 | /api           | 8080 (docker) |
| AOM Front      | `aom`      | http://localhost:4200 | /dashboard-aom | 4200          |
| Registry Front | `registry` |                       | /dashboard-aom |               |

### Installation

1. Clone the repository and `cd` to it
2. Run `make install` to setup all dependencies on all microservices

### Configuration

#### Secrets configuration

For all **secrets**, use the `.env` file which is **NOT COMMITED** to Git.

For none secret values configuring the system, commit the ENV vars in `docker-compose.yml`

For _static_ application configuration (INSEE codes, timeout, etc.) edit/add the `.yml` files in `config/` folder.

```js
const config = require("@pdc/config");
console.log(config.camelCasedFileName);
```

### Development workflow

1. Run `docker-compose up api` to start the backend
2. Run `docker-compose up aom` to start the AOM front
3. Run `docker-compose up reg` to start the registry front
4. Run `docker-compose up ope` to start the operator front

`Ctrl-C` to kill the process

3. Run `make operator` to start the Operator front and `ng serve --host 0.0.0.0 --port 4400` when
the container has started

`Ctrl-C` to kill the process

### API documentation

La documentation est sur [Postman](https://documenter.getpostman.com/view/856020/RzZ9HzgR).

### Misc

Thanks to the POP project for the NodeJS framework starter.
Checkout their project on 
[Plateforme ouverte du Patrimoine](https://beta.gouv.fr/startup/pop.html)

