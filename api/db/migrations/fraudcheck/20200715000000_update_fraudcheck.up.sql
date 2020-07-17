DROP MATERIALIZED VIEW IF EXISTS fraudcheck.processable_carpool;
DROP TABLE IF EXISTS fraudcheck.method_repository;

CREATE TYPE fraudcheck.result AS (
  method varchar(128),
  status fraudcheck.status_enum,
  karma float,
  meta json
);

create or replace function fraudcheck.result_to_json(_ti fraudcheck.result) returns json as $$
  select json_build_object(
    'method', $1.method
  , 'status', $1.status
  , 'karma', $1.karma
  , 'meta', $1.meta
  );
$$ language sql;

create cast (fraudcheck.result as json) with function fraudcheck.result_to_json(_ti fraudcheck.result) as assignment;

create or replace function fraudcheck.result_array_to_json(_ti fraudcheck.result[]) returns json as $$
  select json_agg(fraudcheck.result_to_json(data)) FROM UNNEST($1) as data;
$$ language sql;

create cast (fraudcheck.result[] as json) with function fraudcheck.result_array_to_json(_ti fraudcheck.result[]) as assignment;

create or replace function fraudcheck.json_to_result(_ti json) returns fraudcheck.result as $$
  select ROW(
    $1->>'method',
    ($1->>'status')::fraudcheck.status_enum,
    ($1->>'karma')::float,
    ($1->>'meta')::json)::fraudcheck.result;
$$ language sql;

create cast (json as fraudcheck.result) with function fraudcheck.json_to_result(_ti json) as assignment;

create or replace function fraudcheck.json_to_result_array(_ti json) returns fraudcheck.result[] as $$
	select array_agg(fraudcheck.json_to_result(value)) from json_array_elements($1)
$$ language sql;

create cast (json as fraudcheck.result[]) with function fraudcheck.json_to_result_array(_ti json) as assignment;


ALTER TABLE fraudcheck.fraudchecks RENAME TO fraudchecks_old;

CREATE TABLE IF NOT EXISTS fraudcheck.fraudchecks
(
  _id serial primary key,

  created_at timestamp with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp with time zone NOT NULL DEFAULT NOW(),
  deleted_at timestamp with time zone,

  acquisition_id integer NOT NULL,
  status fraudcheck.status_enum NOT NULL DEFAULT 'pending',
  karma float DEFAULT 0,
  data fraudcheck.result[]
);

CREATE UNIQUE INDEX ON fraudcheck.fraudchecks(acquisition_id);
CREATE INDEX ON fraudcheck.fraudchecks(status);

CREATE TRIGGER touch_fraudchecks_updated_at BEFORE UPDATE ON fraudcheck.fraudchecks FOR EACH ROW EXECUTE PROCEDURE common.touch_updated_at();

INSERT INTO fraudcheck.fraudchecks (
  acquisition_id,
  created_at,
  updated_at,
  status,
  data
) SELECT
  acquisition_id,
  max(created_at) as created_at,
  max(updated_at) as updated_at,
  'pending' as status,
  array_agg(ROW(method, status, karma, meta)::fraudcheck.result) as data
FROM fraudcheck.fraudchecks_old
GROUP BY acquisition_id;

DROP TABLE IF EXISTS fraudcheck.fraudchecks_old;

CREATE MATERIALIZED VIEW fraudcheck.processable_carpool AS (
  SELECT
    distinct cc.acquisition_id
  FROM carpool.carpools AS cc
  LEFT JOIN fraudcheck.fraudchecks AS ff
    ON ff.acquisition_id = cc.acquisition_id
    AND ff.status = 'done'::fraudcheck.status_enum
  WHERE cc.datetime >= (NOW() - '45 days'::interval) AND
  ff.acquisition_id IS NULL
);

CREATE UNIQUE INDEX ON fraudcheck.processable_carpool(acquisition_id);
