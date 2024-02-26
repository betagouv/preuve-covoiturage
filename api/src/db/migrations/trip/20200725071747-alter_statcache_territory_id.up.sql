DROP TABLE IF EXISTS trip.stat_cache;

CREATE TABLE trip.stat_cache
(
  hash VARCHAR(32) PRIMARY KEY,
  updated_at timestamp with time zone NOT NULL DEFAULT NOW(),
  data JSON NOT NULL
);
