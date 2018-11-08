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
3. Run `make start` to start the backend
4. Run `make aom` to start the AOM front and `ng serve --host 0.0.0.0` when
   the container has started

`Ctrl-C` to kill the process

### Development workflow

1. Start the services: `docker-compose up`

### Misc

Thanks to the POP project for the NodeJS framework starter.
Checkout their project on 
[Plateforme ouverte du Patrimoine](https://beta.gouv.fr/startup/pop.html)

