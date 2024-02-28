CREATE TABLE certificate.certificates_new
(
  _id serial primary key,
	uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
	identity_uuid uuid NOT NULL,
	operator_id varchar NOT NULL,
	start_at timestamp with time zone,
	end_at timestamp with time zone,
	created_at timestamp with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp with time zone NOT NULL DEFAULT NOW(),
	meta jsonb NOT NULL DEFAULT '{}'
);

CREATE UNIQUE INDEX ON certificate.certificates_new (uuid);
CREATE INDEX ON certificate.certificates_new (identity_uuid, operator_id);

CREATE TRIGGER touch_certificates_updated_at BEFORE UPDATE
  ON certificate.certificates_new FOR EACH ROW EXECUTE PROCEDURE common.touch_updated_at();

INSERT INTO
  certificate.certificates_new
  SELECT
    cc._id AS _id,
    cc.uuid AS uuid,
    ci.uuid AS identity_uuid,
    cc.operator_id AS operator_id,
    cc.start_at AS start_at,
    cc.end_at AS end_at,
    cc.created_at AS created_at,
    cc.updated_at AS updated_at,
    cc.meta AS meta
  FROM certificate.certificates AS cc
  LEFT JOIN carpool.identities AS ci
  ON cc.identity_id = ci._id;

ALTER TABLE certificate.certificates RENAME TO certificates_old;
ALTER TABLE certificate.certificates_new RENAME TO certificates;

ALTER TABLE certificate.certificates
  ALTER COLUMN _id SET DEFAULT nextval('certificate.certificates__id_seq');
ALTER SEQUENCE certificate.certificates__id_seq
  OWNED BY certificate.certificates._id;
  