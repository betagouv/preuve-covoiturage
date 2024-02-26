-- replace rule name in all policies

UPDATE policy.policies
SET global_rules = REPLACE(global_rules::text, 'max_trip_restriction', 'max_trip_per_target_restriction')::json
WHERE global_rules::text LIKE '%max_trip_restriction%';
