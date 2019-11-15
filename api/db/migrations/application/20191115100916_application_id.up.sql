-- BEFORE
--                                  Table "application.applications"
--     Column     |            Type             | Collation | Nullable |           Default
-- ---------------+-----------------------------+-----------+----------+------------------------------
--  _id           | uuid                        |           | not null | uuid_generate_v4()
--  created_at    | timestamp without time zone |           | not null | now()
--  deleted_at    | timestamp without time zone |           |          |
--  name          | character varying           |           | not null |
--  owner_id      | character varying           |           | not null |
--  owner_service | character varying           |           | not null |
--  permissions   | character varying[]         |           |          | ARRAY[]::character varying[]
-- Indexes:
--     "applications_pkey" PRIMARY KEY, btree (_id)
--     "applications_owner_service_owner_id_idx" btree (owner_service, owner_id)

-- AFTER
--                                  Table "application.applications"
--     Column     |            Type             | Collation | Nullable |           Default
-- ---------------+-----------------------------+-----------+----------+------------------------------
--  _id           | integer                     |           | not null | nextval('application.applications__id_seq'::regclass)
--  uuid          | character varying           |           | not null | uuid_generate_v4()
--  created_at    | timestamp without time zone |           | not null | now()
--  deleted_at    | timestamp without time zone |           |          |
--  name          | character varying           |           | not null |
--  owner_id      | character varying           |           | not null |
--  owner_service | character varying           |           | not null |
--  permissions   | character varying[]         |           |          | ARRAY[]::character varying[]
-- Indexes:
--     "applications_pkey" PRIMARY KEY, btree (_id)
--     "applications_owner_service_owner_id_idx" btree (owner_service, owner_id)

-- Create new table with the new schema
DROP TABLE IF EXISTS application.applications_new;
CREATE TABLE application.applications_new
(
  _id serial primary key,
  uuid varchar default uuid_generate_v4 (),

  created_at timestamp NOT NULL DEFAULT NOW(),
  deleted_at timestamp,

  name varchar NOT NULL,
  owner_id varchar NOT NULL,
  owner_service varchar NOT NULL,
  permissions varchar[] DEFAULT array[]::varchar[]
);

-- copy data from one table to the other
INSERT INTO application.applications_new (uuid, created_at, deleted_at, name, owner_id, owner_service, permissions)
SELECT _id, created_at, deleted_at, name, owner_id, owner_service, permissions
FROM application.applications;

-- drop old table
DROP TABLE application.applications;

-- rename new table
ALTER TABLE application.applications_new RENAME TO applications;

-- recreate index
CREATE INDEX ON application.applications (uuid);
CREATE INDEX ON application.applications (owner_service, owner_id);
