CREATE TABLE IF NOT EXISTS operator.operators
(
  _id serial primary key,
  
  nom_commercial varchar NOT NULL,
  raison_sociale varchar NOT NULL,
  siret varchar NOT NULL,

  company json NOT NULL,
  address json NOT NULL,
  bank json NOT NULL,
  contacts json NOT NULL,

  cgu_accepted_at timestamp,
  cgu_accepted_by varchar,

  created_at timestamp NOT NULL DEFAULT NOW(),
  updated_at timestamp NOT NULL DEFAULT NOW(),
  deleted_at timestamp
);

CREATE UNIQUE INDEX ON operator.operators (siret);