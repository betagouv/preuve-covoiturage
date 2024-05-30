-- step 1
-- create the new column as BIGINT
ALTER TABLE carpool_v2.carpools ADD COLUMN legacy_id BIGINT;

-- step 2
-- populate the new column with the values from acquisition_id
UPDATE carpool_v2.carpools c2
SET legacy_id = c1.acquisition_id::BIGINT
FROM carpool.carpools c1
WHERE c1.operator_id = c2.operator_id
  AND c1.operator_journey_id = c2.operator_journey_id
  AND c1.is_driver = true
  AND c1.acquisition_id IS NOT NULL
  AND c2.legacy_id IS NULL;

-- step 3
-- create carpool_v2.carpools_legacy_id_seq sequence
CREATE SEQUENCE carpool_v2.carpools_legacy_id_seq;
ALTER TABLE carpool_v2.carpools ALTER COLUMN legacy_id SET DEFAULT nextval('carpool_v2.carpools_legacy_id_seq'::regclass);

-- step 4
-- make legacy_id a serial
ALTER TABLE carpool_v2.carpools ALTER COLUMN legacy_id SET NOT NULL;
