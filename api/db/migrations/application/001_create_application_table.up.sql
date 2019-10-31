CREATE TABLE IF NOT EXISTS application.applications
(
  _id serial primary key,

  name varchar NOT NULL,
  owner_id varchar NOT NULL,
  owner_service varchar NOT NULL,
  permissions varchar[] DEFAULT array[]::varchar[],

  created_at timestamp NOT NULL DEFAULT NOW(),
  deleted_at timestamp
);

CREATE INDEX ON application.applications (owner_service, owner_id);
