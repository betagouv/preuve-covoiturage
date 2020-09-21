-- RETURN ALL ANCESTORS ID
DROP FUNCTION IF EXISTS territory.get_ancestors;
CREATE OR REPLACE FUNCTION territory.get_ancestors(ids int[]) RETURNS int[] AS $$
  WITH RECURSIVE ancestors AS (
    SELECT 
      t.parent_territory_id AS ancestor
    FROM territory.territory_relation AS t
    JOIN unnest(ids) AS input_id ON input_id = t.child_territory_id
    UNION ALL
    SELECT
      t.parent_territory_id AS ancestor
    FROM territory.territory_relation AS t
    JOIN ancestors AS l ON l.ancestor = t.child_territory_id
  ) SELECT array_agg(distinct ancestor) FROM ancestors;
$$
LANGUAGE sql STABLE;

-- RETURN ALL DESCENDANTS ID
DROP FUNCTION IF EXISTS territory.get_descendants;
CREATE OR REPLACE FUNCTION territory.get_descendants(ids int[]) RETURNS int[] AS $$
  WITH RECURSIVE descendants AS (
    SELECT 
      t.child_territory_id AS descendant
    FROM territory.territory_relation AS t
    JOIN unnest(ids) AS input_id ON input_id = t.parent_territory_id
    UNION ALL
    SELECT
      t.child_territory_id AS descendant
    FROM territory.territory_relation AS t
    JOIN descendants AS l ON l.descendant = t.parent_territory_id
  ) SELECT array_agg(distinct descendant) FROM descendants;
$$
LANGUAGE sql STABLE;

-- RETURN ALL RELATION ID
DROP FUNCTION IF EXISTS territory.get_relations;
CREATE OR REPLACE FUNCTION territory.get_relations(ids int[]) RETURNS int[] AS $$
  WITH data AS (
    SELECT * FROM unnest(territory.get_descendants(ids)) as _id
    UNION
    SELECT * FROM unnest(territory.get_ancestors(ids)) as _id
  ) SELECT array_agg(distinct _id) from data;
$$
LANGUAGE sql STABLE;

-- GET ALL COMPILED DATA AS ROW OF territories_view
DROP FUNCTION IF EXISTS territory.get_territory_view_data;
CREATE OR REPLACE FUNCTION territory.get_territory_view_data(ids int[])
  RETURNS SETOF territory.territories_view AS $$
BEGIN RETURN QUERY

WITH RECURSIVE
  -- get _id as table filter existing on territory.territories
  input AS (
    SELECT distinct t._id FROM UNNEST(ids::int[]) as unnest_id
    JOIN territory.territories AS t on t._id = unnest_id
  )
  -- get all ancestors of ids
  ,ancestors AS (
    SELECT
      i._id,
      t.parent_territory_id AS ancestor,
      1 as level
    FROM territory.territory_relation AS t
    JOIN input AS i ON i._id = t.child_territory_id
    UNION ALL
    SELECT
      l._id,
      t.parent_territory_id AS ancestor,
      l.level + 1 as level
    FROM territory.territory_relation AS t
    JOIN ancestors AS l ON l.ancestor = t.child_territory_id
  )
  -- get all descendants of ids
  ,descendants AS (
    SELECT
      i._id,
      t.child_territory_id AS descendant,
      1 as level
    FROM territory.territory_relation AS t
    JOIN input AS i ON i._id = t.parent_territory_id
    UNION ALL
    SELECT
      l._id,
      t.child_territory_id AS descendant,
      l.level + 1 as level
    FROM territory.territory_relation AS t
    JOIN descendants AS l ON l.descendant = t.parent_territory_id
  )
  -- get code from _id + descendants
  ,codes AS (
    SELECT
      tc.territory_id,
      array_remove(array_agg(tc.value) FILTER(where tc.type = 'insee'), null) AS insee,
      array_remove(array_agg(tc.value) FILTER(where tc.type = 'postcode'), null) AS postcode,
      array_remove(array_agg(tc.value) FILTER(where tc.type = 'codedep'), null) AS codedep
    FROM input as i 
    LEFT JOIN descendants as d ON d._id = i._id
    JOIN territory.territory_codes as tc ON tc.territory_id = i._id OR tc.territory_id = d.descendant
    GROUP BY tc.territory_id
  )
  -- get breadcrumb from _id + ancestor
  ,breadcrumb AS (
    SELECT
      i._id as _id,
      array_remove(array_agg(country.name), NULL) as country,
      array_remove(array_agg(countrygroup.name), NULL) as countrygroup,
      array_remove(array_agg(district.name), NULL) as district,
      array_remove(array_agg(megalopolis.name), NULL) as megalopolis,
      array_remove(array_agg(other.name), NULL) as other,
      array_remove(array_agg(region.name), NULL) as region,
      array_remove(array_agg(state.name), NULL) as state,
      array_remove(array_agg(town.name), NULL) as town,
      array_remove(array_agg(towngroup.name), NULL) as towngroup
    FROM input as i
    LEFT JOIN ancestors as a on a._id = i._id
    LEFT JOIN territory.territories as country on (a._id = country._id OR a.ancestor = country._id) AND country.level = 'country'
    LEFT JOIN territory.territories as countrygroup on (a._id = countrygroup._id OR a.ancestor = countrygroup._id) AND countrygroup.level = 'countrygroup'
    LEFT JOIN territory.territories as district on (a._id = district._id OR a.ancestor = district._id) AND district.level = 'district'
    LEFT JOIN territory.territories as megalopolis on (a._id = megalopolis._id OR a.ancestor = megalopolis._id) AND megalopolis.level = 'megalopolis'
    LEFT JOIN territory.territories as other on (a._id = other._id OR a.ancestor = other._id) AND other.level = 'other'
    LEFT JOIN territory.territories as region on (a._id = region._id OR a.ancestor = region._id) AND region.level = 'region'
    LEFT JOIN territory.territories as state on (a._id = state._id OR a.ancestor = state._id) AND state.level = 'state'
    LEFT JOIN territory.territories as town on (a._id = town._id OR a.ancestor = town._id) AND town.level = 'town'
    LEFT JOIN territory.territories as towngroup on (a._id = towngroup._id OR a.ancestor = towngroup._id) AND towngroup.level = 'towngroup'
    GROUP BY i._id
  )
  -- aggregate
  ,agg AS (
    SELECT
      i._id,
      array_remove(array_agg(distinct d.descendant), NULL) as descendants,
      array_remove(array_agg(distinct ch.descendant), NULL) as children,
      array_remove(array_agg(distinct a.ancestor), NULL) as ancestors,
      array_remove(array_agg(distinct pa.ancestor), NULL) as parents,
      array_remove(array_agg(distinct _insee), NULL) as insee,
      array_remove(array_agg(distinct _postcode), NULL) as postcode,
      array_remove(array_agg(distinct _codedep), NULL) as codedep
    FROM input as i
    LEFT JOIN descendants as d on i._id = d._id
    LEFT JOIN descendants as ch on i._id = ch._id AND ch.level = 1
    LEFT JOIN ancestors as a on i._id = a._id
    LEFT JOIN ancestors as pa on i._id = pa._id AND pa.level = 1
    LEFT JOIN codes as c ON i._id = c.territory_id OR c.territory_id = d.descendant
    LEFT JOIN unnest(c.insee) as _insee ON TRUE
    LEFT JOIN unnest(c.postcode) as _postcode ON TRUE
    LEFT JOIN unnest(c.codedep) as _codedep ON TRUE
    GROUP BY i._id
  )
  -- final select with formatting
  SELECT
    a._id::int,
    t.active::boolean,
    t.activable::boolean,
    t.level::territory.territory_level_enum,
    a.parents,
    a.children,
    a.ancestors::int[],
    a.descendants::int[],
    a.insee::varchar[],
    a.postcode::varchar[],
    a.codedep::varchar[]
    ,row(
      bc.country[1],
      bc.countrygroup[1],
      bc.district[1],
      bc.megalopolis[1],
      bc.other[1],
      bc.region[1],
      bc.state[1],
      bc.town[1],
      bc.towngroup[1]
    )::territory.breadcrumb as breadcrumb
  FROM agg AS a
  LEFT JOIN territory.territories AS t ON t._id = a._id
  LEFT JOIN breadcrumb AS bc ON bc._id = a._id;
END;
$$ LANGUAGE plpgsql STABLE;


-- This function insert or update fresh data from set of ids
DROP FUNCTION IF EXISTS territory.update_territory_view_data;
CREATE OR REPLACE FUNCTION territory.update_territory_view_data(ids int[]) RETURNS VOID AS $$ 
BEGIN
  WITH tv as (
    SELECT * from territory.get_territory_view_data(ids) 
  )
  INSERT INTO territory.territories_view (
    _id,
    active,
    activable,
    level,
    parents,
    children,
    ancestors,
    descendants,
    insee,
    postcode,
    codedep,
    breadcrumb
  ) SELECT * FROM tv ON CONFLICT (_id)
  DO UPDATE
    SET (
      parents,
      children,
      ancestors,
      descendants,
      active,
      activable,
      level,
      insee,
      postcode,
      codedep,
      breadcrumb
    ) = (
      excluded.parents,
      excluded.children,
      excluded.ancestors,
      excluded.descendants,
      excluded.active,
      excluded.activable,
      excluded.level,
      excluded.insee,
      excluded.postcode,
      excluded.codedep,
      excluded.breadcrumb
    );
    RETURN;
END
$$ LANGUAGE plpgsql;
