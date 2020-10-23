CREATE TABLE IF NOT EXISTS honor.tracking
(
  _id serial primary key,
  created_at timestamp with time zone NOT NULL DEFAULT NOW(),
  type varchar(32) NOT NULL
);

CREATE INDEX ON honor.tracking (type, created_at);
