CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS application.applications
(
  _id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),

  created_at timestamp NOT NULL DEFAULT NOW(),
  deleted_at timestamp,

  name varchar NOT NULL,
  owner_id varchar NOT NULL,
  owner_service varchar NOT NULL,
  permissions varchar[] DEFAULT array[]::varchar[]
);

CREATE INDEX ON application.applications (owner_service, owner_id);
