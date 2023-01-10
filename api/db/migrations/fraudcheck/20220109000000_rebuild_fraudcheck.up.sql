DROP MATERIALIZED VIEW IF EXISTS fraudcheck.processable_carpool;
ALTER TABLE fraudcheck.fraudchecks RENAME TO fraudchecks_old;

CREATE TABLE IF NOT EXISTS fraudcheck.fraudchecks
(
  _id serial primary key,
  created_at timestamp with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp with time zone NOT NULL DEFAULT NOW(),
  acquisition_id integer NOT NULL REFERENCES carpool.carpools(_id),
  status fraudcheck.status_enum NOT NULL DEFAULT 'pending',
  karma float NOT NULL DEFAULT 0
);

CREATE INDEX ON fraudcheck.fraudchecks(created_at);
CREATE INDEX ON fraudcheck.fraudchecks(status);
CREATE UNIQUE INDEX ON fraudcheck.fraudchecks(acquisition_id);
CREATE TRIGGER touch_fraud_updated_at BEFORE UPDATE ON fraudcheck.fraudchecks FOR EACH ROW EXECUTE PROCEDURE common.touch_updated_at();

CREATE TABLE IF NOT EXISTS fraudcheck.results (
  _id serial primary key,
  acquisition_id integer NOT NULL REFERENCES carpool.carpools(_id),
  method varchar(128) NOT NULL,
  uuid uuid NOT NULL,
  status fraudcheck.status_enum NOT NULL DEFAULT 'pending',
  runned_at timestamp with time zone NOT NULL DEFAULT NOW(),
  karma float NOT NULL DEFAULT 0,
  data json
);

CREATE INDEX ON fraudcheck.results(uuid);
CREATE INDEX ON fraudcheck.results(acquisition_id);

CREATE OR REPLACE FUNCTION hydrate_fraud_from_carpool() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO fraudcheck.fraudchecks (acquisition_id)
    SELECT cc.acquisition_id FROM carpool.carpools AS cc
    WHERE cc._id = NEW._id AND cc.status = 'ok'
    ON CONFLICT (acquisition_id)
    DO UPDATE SET
      status = 'pending';
    RETURN NULL;
END;
$$ language plpgsql;

CREATE TRIGGER hydrate_fraud_from_carpool
    AFTER INSERT OR UPDATE ON carpool.carpools
    FOR EACH ROW EXECUTE PROCEDURE hydrate_fraud_from_carpool();
