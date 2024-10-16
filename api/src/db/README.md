# Installation

```
npm install -g db-migrate db-migrate-pg
```

### Geo

7zip doit être installé afin de créer la table du référentiel géographique

```
npm run geo:import
```

# Usage

- basic
  `DATABASE_URL=postgres://postgres:postgres@postgres:5432/local db-migrate up`
- with migrations dir
  `DATABASE_URL=postgres://test:test@localhost:5432/test db-migrate up -m /path/to/migrations`
- verbose
  `DATABASE_URL=postgres://test:test@localhost:5432/test db-migrate up -v`
