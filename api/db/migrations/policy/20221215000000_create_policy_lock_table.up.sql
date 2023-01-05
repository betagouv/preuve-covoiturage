CREATE TABLE IF NOT EXISTS policy.lock
(
  _id serial primary key,
  started_at timestamp with time zone NOT NULL DEFAULT NOW(),
  stopped_at timestamp with time zone,
  success boolean,
  data json
);

CREATE INDEX ON policy.lock(stopped_at);
