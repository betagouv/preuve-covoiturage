CREATE TABLE IF NOT EXISTS policy.policy_metas
(
  _id serial primary key,
  policy_id integer REFERENCES policy.policies (_id),
  key varchar,
  value json
);
