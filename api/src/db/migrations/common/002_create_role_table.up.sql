CREATE TABLE IF NOT EXISTS common.roles
(
  slug varchar primary key,
  description varchar,
  permissions varchar[]
);
