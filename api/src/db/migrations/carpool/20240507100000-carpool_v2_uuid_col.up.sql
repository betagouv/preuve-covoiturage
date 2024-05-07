DO $$
BEGIN
  IF NOT (
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'carpool_v2'
        AND table_name = 'carpools'
        AND column_name = 'uuid'
    )
  ) THEN
    ALTER TABLE carpool_v2.carpools
      ADD COLUMN uuid UUID NOT NULL DEFAULT uuid_generate_v4();
  END IF;
END $$;
