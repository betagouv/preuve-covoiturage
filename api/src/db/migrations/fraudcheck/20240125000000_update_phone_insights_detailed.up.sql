ALTER TABLE fraudcheck.phone_insights_detailed
  ALTER COLUMN operator_user_id TYPE varchar USING operator_user_id::varchar;