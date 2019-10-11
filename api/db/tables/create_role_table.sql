CREATE TABLE roles
(
  slug varchar primary key,
  description varchar,
  permissions varchar[],
);
