CREATE TABLE IF NOT EXISTS policy.lock
(
  _id serial primary key,
  started_at timestamp with time zone NOT NULL DEFAULT NOW(),
  stopped_at timestamp with time zone,
  from_date timestamp with time zone,
  to_date timestamp with time zone,
  success boolean,
  error json 
);

INSERT INTO policy.lock(_id, started_at, stopped_at) values (1, now(), now());