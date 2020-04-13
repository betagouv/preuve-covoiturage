CREATE MATERIALIZED VIEW fraudcheck.processable_carpool AS (
  WITH data AS (
    SELECT 
      cc.acquisition_id,
      array_remove(array_agg(ff.method ORDER BY ff.method ASC), NULL) AS methods
    FROM carpool.carpools AS cc
    LEFT JOIN fraudcheck.fraudchecks AS ff
      ON ff.acquisition_id::int = cc.acquisition_id AND ff.status = 'done'::fraudcheck.status_enum
      -- "10 days" au lieu de 45
    WHERE cc.datetime >= (NOW() - interval '45 days') AND cc.datetime < (NOW() - interval '5 days')
    GROUP BY cc.acquisition_id
  ), methods AS (
    SELECT distinct fr._id AS name
    FROM fraudcheck.method_repository AS fr
    WHERE fr.active = true
  )
  SELECT
    distinct d.acquisition_id AS acquisition_id,
    d.methods
  FROM data AS d 
  WHERE NOT (d.methods @> ARRAY(SELECT name FROM methods))
);

CREATE UNIQUE INDEX ON fraudcheck.processable_carpool(acquisition_id);

--- MATERIALIZED TABLE
--- updated_at (last)
--- score global
--- acquisition_id

