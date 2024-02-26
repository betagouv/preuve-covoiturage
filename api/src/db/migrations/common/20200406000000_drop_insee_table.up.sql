DROP TABLE common.insee;

ALTER TABLE carpool.carpools
  DROP COLUMN start_insee CASCADE,
  DROP COLUMN end_insee CASCADE;