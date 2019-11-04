CREATE TYPE auth.user_status_enum as enum('pending', 'active', 'invited');

CREATE TABLE IF NOT EXISTS auth.users
(
  _id serial primary key,

  operator_id varchar,
  territory_id varchar,
  
  email varchar NOT NULL,
  firstname varchar NOT NULL,
  lastname varchar NOT NULL,
  phone varchar,
  
  password varchar,
  status auth.user_status_enum NOT NULL DEFAULT 'pending',

  token varchar,
  token_expires_at timestamp,

  role varchar NOT NULL,

  created_at timestamp NOT NULL DEFAULT NOW(),
  updated_at timestamp NOT NULL DEFAULT NOW(),
  deleted_at timestamp,

  ui_status json
);

CREATE UNIQUE INDEX ON auth.users(email);