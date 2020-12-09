CREATE TABLE IF NOT EXISTS operator.thumbnails
(
  _id serial primary key,
  operator_id int not null references operator.operators on delete cascade,
  created_at timestamp with time zone NOT NULL DEFAULT NOW(),
  data bytea not null
);

CREATE INDEX ON operator.thumbnails (operator_id);
