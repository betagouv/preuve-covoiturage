# Installation

```
npm install -g db-migrate db-migrate-pg
```

# Usage

- basic `DATABASE_URL=postgres://postgres:postgres@postgres:5432/local db-migrate up`
- with migrations dir `DATABASE_URL=postgres://test:test@localhost:5432/test db-migrate up -m /path/to/migrations`
- verbose `DATABASE_URL=postgres://test:test@localhost:5432/test db-migrate up -v`
