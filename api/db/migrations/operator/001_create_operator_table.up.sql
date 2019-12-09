CREATE TABLE IF NOT EXISTS operator.operators
(
  _id serial primary key,

  created_at timestamp with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp with time zone NOT NULL DEFAULT NOW(),
  deleted_at timestamp with time zone,

  name varchar NOT NULL,
  legal_name varchar NOT NULL,
  siret varchar NOT NULL,

  cgu_accepted_at timestamp with time zone,
  cgu_accepted_by varchar,

  company json NOT NULL,
  address json NOT NULL,
  bank json NOT NULL,
  contacts json NOT NULL
);

CREATE INDEX ON operator.operators (siret);

CREATE TRIGGER touch_operators_updated_at BEFORE UPDATE ON operator.operators FOR EACH ROW EXECUTE PROCEDURE common.touch_updated_at();
