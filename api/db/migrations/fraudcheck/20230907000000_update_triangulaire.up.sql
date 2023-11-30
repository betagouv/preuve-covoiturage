ALTER TABLE fraudcheck.phone_insights DROP COLUMN carpool_day_list;
ALTER TABLE fraudcheck.phone_insights DROP COLUMN trip_id_list;
ALTER TABLE fraudcheck.phone_insights DROP COLUMN operator_list;

ALTER TABLE fraudcheck.phone_insights ADD COLUMN IF NOT EXISTS carpool_day_list VARCHAR[];
ALTER TABLE fraudcheck.phone_insights ADD COLUMN IF NOT EXISTS trip_id_list VARCHAR[];
ALTER TABLE fraudcheck.phone_insights ADD COLUMN IF NOT EXISTS operator_list INTEGER[];

DROP INDEX IF EXISTS fraudcheck.potential_triangular_patterns_id_groupe_phone_trunc_idx;

ALTER TABLE fraudcheck.potential_triangular_patterns DROP COLUMN phone_trunc;
ALTER TABLE fraudcheck.potential_triangular_patterns ADD COLUMN IF NOT EXISTS phone_trunc VARCHAR[];

CREATE UNIQUE INDEX on fraudcheck.potential_triangular_patterns (id, groupe, phone_trunc);