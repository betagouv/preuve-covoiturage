CREATE TABLE IF NOT EXISTS operator.operators
(
  _id serial primary key,

  created_at timestamp with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp with time zone NOT NULL DEFAULT NOW(),
  deleted_at timestamp with time zone,

  name varchar NOT NULL,
  legal_name varchar NOT NULL, -- DROP
  siret varchar NOT NULL, -- DROP

  cgu_accepted_at timestamp with time zone, -- rename active_since
  cgu_accepted_by varchar, -- rename active boolean

  company json NOT NULL, --DROP
  bank json NOT NULL,
  address json NOT NULL, --DROP
  contacts json NOT NULL
);

CREATE INDEX ON operator.operators (siret);

CREATE TRIGGER touch_operators_updated_at BEFORE UPDATE ON operator.operators FOR EACH ROW EXECUTE PROCEDURE common.touch_updated_at();
