-- operator_journey_id can be NULL on long distance applications
DO $$
BEGIN
  IF NOT (
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'cee'
        AND table_name = 'cee_applications'
        AND column_name = 'operator_journey_id'
    )
  ) THEN
    ALTER TABLE cee.cee_applications
      ADD COLUMN operator_journey_id VARCHAR(255) NULL;
  END IF;
END $$;

-- replace the uniqueness of the carpool_id on short distance applications
CREATE UNIQUE INDEX IF NOT EXISTS cee_operator_id_operator_journey_id_on_short
  ON cee.cee_applications (operator_id, operator_journey_id)
  WHERE is_specific = false AND journey_type = 'short';

-- drop unique index on carpool_id
DROP INDEX IF EXISTS cee.cee_carpool_id_on_short_application;

-- drop check on carpool for short distance applications
DO $$
BEGIN
  IF (
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.check_constraints
      WHERE constraint_schema = 'cee'
        AND constraint_name = 'cee_carpool_id_constraint'
    )
  ) THEN
    ALTER TABLE cee.cee_applications
      DROP CONSTRAINT cee_carpool_id_constraint;
  END IF;
END $$;

-- update the operator_id, operator_journey_id from carpool V1
UPDATE cee.cee_applications ce
  SET operator_journey_id = cc.operator_journey_id
FROM carpool.carpools cc
WHERE ce.carpool_id = cc._id
  AND ce.operator_journey_id IS NULL
  AND ce.carpool_id IS NOT NULL;

-- check constraint to ensure that operator_journey_id is not null on short distance applications
DO $$
BEGIN
  IF NOT (
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.check_constraints
      WHERE constraint_schema = 'cee'
        AND constraint_name = 'cee_operator_id_operator_journey_id_check_constraint'
    )
  ) THEN
    ALTER TABLE cee.cee_applications
      ADD CONSTRAINT cee_operator_id_operator_journey_id_check_constraint
      CHECK (
        CASE
          WHEN journey_type = 'short' AND is_specific = false
          THEN operator_journey_id IS NOT NULL
          ELSE operator_journey_id IS NULL
        END
      );
  END IF;
END $$;
