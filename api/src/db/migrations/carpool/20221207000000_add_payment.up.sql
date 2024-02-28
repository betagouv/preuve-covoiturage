ALTER TABLE carpool.carpools ADD COLUMN payment INT;

UPDATE carpool.carpools
SET payment = sub.payment FROM (
  SELECT
    cc._id,
    CASE
      WHEN cc.is_driver THEN
      (aa.payload#>>'{driver,revenue}')::numeric::int
      ELSE
      (aa.payload#>>'{passenger,contribution}')::numeric::int
    END as payment
  FROM carpool.carpools cc
  JOIN acquisition.acquisitions aa 
    ON cc.acquisition_id = aa._id
  WHERE cc.payment IS NULL
) AS sub WHERE carpools._id = sub._id
