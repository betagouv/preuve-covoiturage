DROP TABLE IF EXISTS trip.stat_cache;

CREATE TABLE IF NOT EXISTS trip.stat_cache
(
  updated_at timestamp with time zone NOT NULL DEFAULT NOW(),
  is_public boolean NOT NULL DEFAULT false,
  territory_id integer,
  operator_id integer,
  data json NOT NULL
);

CREATE UNIQUE INDEX ON trip.stat_cache(is_public, territory_id, operator_id);
