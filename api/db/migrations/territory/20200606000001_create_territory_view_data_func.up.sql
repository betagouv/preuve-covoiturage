
DROP FUNCTION IF EXISTS territory.get_territory_view_data;

CREATE OR REPLACE FUNCTION territory.get_territory_view_data(ids int[]) RETURNS TABLE(
    _id int,
    active boolean,
    activable boolean,
    level territory.territory_level_enum,
    parents int[],
    children int[],
    ancestors int[],
    descendants int[],
    insee varchar[],
    postcode varchar[],
    codedep varchar[],
    breadcrumb territory.breadcrumb
)  AS $$ 
BEGIN

RETURN QUERY WITH RECURSIVE
  input AS (
    SELECT * FROM UNNEST(ids) as _id
  )
  ,ancestors AS (
    SELECT
      i._id,
      t.parent_territory_id AS ancestor
    FROM territory.territory_relation AS t
    JOIN input AS i ON i._id = t.child_territory_id
    UNION ALL
    SELECT
      l._id,
      t.parent_territory_id AS ancestor
    FROM territory.territory_relation AS t
    JOIN ancestors AS l ON l.ancestor = t.child_territory_id
  )
  ,descendants AS (
    SELECT
      i._id,
      t.child_territory_id AS descendant
    FROM territory.territory_relation AS t
    JOIN input AS i ON i._id = t.parent_territory_id
    UNION ALL
    SELECT
      l._id,
      t.child_territory_id AS descendant
    FROM territory.territory_relation AS t
    JOIN descendants AS l ON l.descendant = t.parent_territory_id
  )
  -- REMOVE
  ,territories AS (
    SELECT distinct ancestors._id FROM ancestors
    UNION
    SELECT distinct ancestors.ancestor FROM ancestors
    UNION
    SELECT distinct descendants._id FROM descendants
    UNION
    SELECT distinct descendants.descendant FROM descendants
  )
  -- REFACTOR
  ,codes AS (
    SELECT
      territory_id,
      array_remove(array_agg(tc.value) FILTER(where tc.type = 'insee'), null) AS insee,
      array_remove(array_agg(tc.value) FILTER(where tc.type = 'postcode'), null) AS postcode,
      array_remove(array_agg(tc.value) FILTER(where tc.type = 'codedep'), null) AS codedep
    FROM territory.territory_codes tc
    JOIN territories as t on t._id = tc.territory_id
    GROUP BY tc.territory_id
  )
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
    LEFT JOIN territory.territories as country on a.ancestor = country._id AND country.level = 'country'
    LEFT JOIN territory.territories as countrygroup on a.ancestor = countrygroup._id AND countrygroup.level = 'countrygroup'
    LEFT JOIN territory.territories as district on a.ancestor = district._id AND district.level = 'district'
    LEFT JOIN territory.territories as megalopolis on a.ancestor = megalopolis._id AND megalopolis.level = 'megalopolis'
    LEFT JOIN territory.territories as other on a.ancestor = other._id AND other.level = 'other'
    LEFT JOIN territory.territories as region on a.ancestor = region._id AND region.level = 'region'
    LEFT JOIN territory.territories as state on a.ancestor = state._id AND state.level = 'state'
    LEFT JOIN territory.territories as town on a.ancestor = town._id AND town.level = 'town'
    LEFT JOIN territory.territories as towngroup on a.ancestor = towngroup._id AND towngroup.level = 'towngroup'
    GROUP BY i._id
  )
  ,agg AS (
    SELECT
      i._id,
      array_remove(array_agg(distinct d.descendant), NULL) as descendants,
      array_remove(array_agg(distinct a.ancestor), NULL) as ancestors,
      array_remove(array_agg(distinct _insee), NULL) as insee,
      array_remove(array_agg(distinct _postcode), NULL) as postcode,
      array_remove(array_agg(distinct _codedep), NULL) as codedep
    FROM input as i
    LEFT JOIN descendants as d on i._id = d._id
    LEFT JOIN ancestors as a on i._id = a._id
    LEFT JOIN codes as c ON i._id = c.territory_id OR c.territory_id = d.descendant
    LEFT JOIN unnest(c.insee) as _insee ON TRUE
    LEFT JOIN unnest(c.postcode) as _postcode ON TRUE
    LEFT JOIN unnest(c.codedep) as _codedep ON TRUE
    GROUP BY i._id
  )
  SELECT
    a._id::int,
    t.active::boolean,
    t.activable::boolean,
    t.level::territory.territory_level_enum,
    tp.parents as parents,
    tc.children as children,
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
  LEFT JOIN breadcrumb AS bc ON bc._id = a._id,
  LATERAL (
    SELECT array_agg(child_territory_id) as children
    FROM territory.territory_relation
    WHERE parent_territory_id = a._id
  ) as tc,
  LATERAL (
    SELECT array_agg(parent_territory_id) as parents
    FROM territory.territory_relation
    WHERE child_territory_id = a._id
  ) as tp;
END;
$$    LANGUAGE plpgsql;


DROP FUNCTION IF EXISTS territory.update_territory_view_data;

CREATE OR REPLACE FUNCTION territory.update_territory_view_data(ids int[]) RETURNS VOID AS $$ 
BEGIN
  WITH tv as (
    SELECT * from territory.get_territory_view_data(ids) 
  )
  UPDATE territory.territories_view
    SET 
        parents = tv.parents,
        children = tv.children,
        ancestors = tv.ancestors,
        descendants = tv.descendants,
        active = tv.active,
        activable = tv.activable,
        level = tv.level,
        insee = tv.insee,
        postcode = tv.postcode,
        codedep = tv.codedep,
        breadcrumb = tv.breadcrumb
    FROM tv
    WHERE territory.territories_view._id = tv._id;
    RETURN;
END
$$ LANGUAGE plpgsql;
