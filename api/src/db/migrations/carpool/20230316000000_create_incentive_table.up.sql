CREATE TABLE carpool.incentives (
  acquisition_id INTEGER NOT NULL REFERENCES acquisition.acquisitions(_id),
  idx SMALLINT NOT NULL,
  datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  siret VARCHAR(14) NOT NULL,
  amount INT NOT NULL
);

CREATE UNIQUE INDEX ON carpool.incentives (acquisition_id, idx);
CREATE INDEX ON carpool.incentives(acquisition_id);
CREATE INDEX ON carpool.incentives(datetime);
CREATE INDEX ON carpool.incentives(siret);

CREATE TYPE carpool.tmp_incentive AS (
  index SMALLINT,
  siret VARCHAR(14),
  amount INT
);

INSERT INTO carpool.incentives (acquisition_id, idx, datetime, siret, amount)
SELECT
  aa._id AS acquisition_id,
  incentive.index::SMALLINT AS idx,
  cc.datetime::TIMESTAMP AS datetime,
  incentive.siret::VARCHAR(14) AS siret,
  incentive.amount::INT AS amount
FROM acquisition.acquisitions aa
JOIN carpool.carpools cc
  ON cc.acquisition_id = aa._id AND cc.is_driver = true
, LATERAL (
  SELECT
    ROW_NUMBER () OVER (ORDER BY index) as index,
    siret,
    amount
  FROM
  json_populate_recordset(null::carpool.tmp_incentive, (aa.payload#>>'{driver,incentives}')::json)
) AS incentive
UNION
SELECT
  aa._id AS acquisition_id,
  incentive.index::SMALLINT + 10 AS idx,
  cc.datetime::TIMESTAMP AS datetime,
  incentive.siret::VARCHAR(14) AS siret,
  incentive.amount::INT AS amount
FROM acquisition.acquisitions aa
JOIN carpool.carpools cc
  ON cc.acquisition_id = aa._id AND cc.is_driver = true
, LATERAL (
  SELECT
    ROW_NUMBER () OVER (ORDER BY index) as index,
    siret,
    amount
  FROM
  json_populate_recordset(null::carpool.tmp_incentive, (aa.payload#>>'{passenger,incentives}')::json)
) AS incentive;

DROP TYPE carpool.tmp_incentive;
