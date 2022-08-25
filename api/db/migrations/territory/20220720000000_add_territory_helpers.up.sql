CREATE OR REPLACE FUNCTION territory.get_selector_by_territory_id(_id int[]) returns table(territory_id int, selector json) as $$
  WITH selector_raw AS (
    SELECT
      territory_group_id,
      selector_type,
      ARRAY_AGG(selector_value) as selector_value
    FROM ${this.territorySelectorTable}
    WHERE territory_group_id = ANY($1)
    GROUP BY territory_group_id, selector_type
  )
  SELECT
    territory_group_id as territory_id,
    JSON_OBJECT_AGG(
      selector_type,
      selector_value
    ) as selector
  FROM selector_raw
  GROUP BY territory_group_id
$$ language sql stable;
