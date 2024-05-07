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

CREATE UNIQUE INDEX IF NOT EXISTS carpool_v2_carpools_uuid_idx ON carpool_v2.carpools (uuid);
