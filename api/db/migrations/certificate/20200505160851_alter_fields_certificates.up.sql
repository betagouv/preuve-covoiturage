-- 1. rename the table
ALTER TABLE certificate.certificates RENAME TO certificates_old;

-- 2. create a new table from the old schema with the joint values
CREATE TABLE certificate.certificates AS
  SELECT
    c._id,
    c.uuid,
    i._id AS identity_id,
    o._id AS operator_id,
    start_at,
    end_at,
    c.created_at,
    c.updated_at,
    c.meta
  FROM certificate.certificates_old AS c
  JOIN carpool.identities AS i
  ON c.identity_uuid::uuid = i.uuid
  JOIN operator.operators AS o
  ON c.operator_uuid::uuid = o.uuid;

-- 3. set primary key and defaults
ALTER TABLE certificate.certificates
  ALTER COLUMN _id SET DEFAULT nextval('certificate.certificates__id_seq');
ALTER SEQUENCE certificate.certificates__id_seq
  OWNED BY certificate.certificates._id;

ALTER TABLE certificate.certificates
  ALTER COLUMN uuid SET DEFAULT uuid_generate_v4();
ALTER TABLE certificate.certificates
  ALTER COLUMN uuid SET NOT NULL;

ALTER TABLE certificate.certificates
  ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE certificate.certificates
  ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE certificate.certificates
  ALTER COLUMN updated_at SET DEFAULT NOW();
ALTER TABLE certificate.certificates
  ALTER COLUMN updated_at SET NOT NULL;
CREATE TRIGGER touch_certificates_updated_at BEFORE UPDATE
  ON certificate.certificates FOR EACH ROW EXECUTE PROCEDURE common.touch_updated_at();

-- 4. create indexes
CREATE UNIQUE INDEX ON certificate.certificates (uuid);
CREATE INDEX ON certificate.certificates (identity_id, operator_id);

-- 5. drop the old table
DROP TABLE IF EXISTS certificate.certificates_old;
