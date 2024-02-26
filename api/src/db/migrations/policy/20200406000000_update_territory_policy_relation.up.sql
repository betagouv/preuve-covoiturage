UPDATE policy.policies
SET territory_id=sub.territory_id
FROM (
  SELECT
    _id as territory_id,
    old_territory_id
  FROM territory.territories
  WHERE
    old_territory_id IN (SELECT territory_id FROM policy.policies)
) as sub
WHERE policies.territory_id = sub.old_territory_id;

-- TODO UDPATE MATERIALIZED VIEW