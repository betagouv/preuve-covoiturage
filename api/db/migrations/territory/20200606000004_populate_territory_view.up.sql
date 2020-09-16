CREATE SCHEMA mig;

-- fast
CREATE TABLE mig.root AS
  SELECT
    t._id,
    array_remove( array_agg( distinct tr.parent_territory_id ), t._id ) AS parents,
    array_remove( array_agg( distinct tr.child_territory_id ), t._id ) AS children
  FROM territory.territories AS t
  LEFT JOIN territory.territory_relation AS tr
  ON t._id = tr.parent_territory_id OR t._id = tr.child_territory_id
  GROUP BY t._id;

SELECT 'root' as name, count(*) from mig.root;

-- fast
CREATE TABLE mig.codes AS
  SELECT
    territory_id,
    array_remove(array_agg(tc.value) FILTER(where tc.type = 'insee'), null) AS insee,
    array_remove(array_agg(tc.value) FILTER(where tc.type = 'postcode'), null) AS postcode,
    array_remove(array_agg(tc.value) FILTER(where tc.type = 'codedep'), null) AS codedep
  FROM territory.territory_codes tc
  GROUP BY tc.territory_id;

SELECT 'codes' as name, count(*) from mig.codes;

-- fast
CREATE TABLE mig.input AS
  SELECT
    r._id,
    r.parents,
    r.children,
    d.insee,
    d.postcode,
    d.codedep
  FROM mig.root AS r
  LEFT JOIN mig.codes AS d
  ON r._id = d.territory_id
  ORDER BY coalesce(array_length(r.children,1),0) ASC;

SELECT 'input' as name, count(*) from mig.input;

-- slow
CREATE TABLE mig.complete_parent AS
  WITH RECURSIVE complete_parent AS (
    SELECT t._id, t.parents
    FROM mig.input AS t
    UNION ALL
      SELECT c._id, t.parents AS parents
      FROM mig.input AS t
      JOIN complete_parent AS c
      ON t._id = any(c.parents)
  ) TABLE complete_parent;

SELECT 'complete_parent' as name, count(*) from mig.complete_parent;

-- slow
CREATE TABLE mig.complete_children AS
  WITH RECURSIVE complete_children AS (
    SELECT t._id, t.children,t.insee,t.postcode,t.codedep
    FROM mig.input AS t
    UNION ALL
      SELECT c._id, t.children AS children, t.insee, t.postcode, t.codedep
      FROM mig.input AS t
      JOIN complete_children AS c
      ON t._id = any(c.children)
  ) TABLE complete_children;

SELECT 'complete_children' as name, count(*) from mig.complete_children;

-- fast
CREATE TABLE mig.complete AS
  SELECT
    cc._id,
    cc.children,
    cc.insee,
    cc.postcode,
    cc.codedep,
    cp.parents
    FROM mig.complete_children AS cc
    LEFT JOIN mig.complete_parent cp
    ON cp._id = cc._id;

SELECT 'complete' as name, count(*) from mig.complete;

--slow
CREATE TABLE mig.agg AS
  SELECT
    c._id,
    array_remove(array_remove(array_agg(distinct p), null), c._id) AS ancestors,
    array_remove(array_remove(array_agg(distinct b), null), c._id) AS descendants,
    array_remove(array_agg(distinct ins), null) AS insee,
    array_remove(array_agg(distinct pos), null) AS postcode,
    array_remove(array_agg(distinct cdp), null) AS codedep,
    array_remove(array_agg(distinct tr.child_territory_id), null)  AS children
  FROM mig.complete AS c
  LEFT JOIN unnest(c.parents) AS p ON true
  LEFT JOIN unnest(c.children) AS b ON true
  LEFT JOIN unnest(c.insee) AS ins ON true
  LEFT JOIN unnest(c.postcode) AS pos ON true
  LEFT JOIN unnest(c.codedep) AS cdp ON true
  LEFT JOIN territory.territory_relation AS tr
  ON (tr.parent_territory_id = c._id)
  GROUP BY c._id;

SELECT 'agg' as name, count(*) from mig.agg;

-- fast
CREATE TABLE mig.bc_array AS
  SELECT
    mig.agg._id as territory_id,
    mig.agg.ancestors,
    (SELECT array_agg(tt.name) FROM territory.territories AS tt WHERE (tt._id = ANY(agg.ancestors) OR tt._id = agg._id) AND tt.level = 'country') as country,
    (SELECT array_agg(tt.name) FROM territory.territories AS tt WHERE (tt._id = ANY(agg.ancestors) OR tt._id = agg._id) and tt.level = 'countrygroup') as countrygroup,
    (SELECT array_agg(tt.name) FROM territory.territories AS tt WHERE (tt._id = ANY(agg.ancestors) OR tt._id = agg._id) and tt.level = 'district') as district,
    (SELECT array_agg(tt.name) FROM territory.territories AS tt WHERE (tt._id = ANY(agg.ancestors) OR tt._id = agg._id) and tt.level = 'megalopolis') as megalopolis,
    (SELECT array_agg(tt.name) FROM territory.territories AS tt WHERE (tt._id = ANY(agg.ancestors) OR tt._id = agg._id) and tt.level = 'other') as other,
    (SELECT array_agg(tt.name) FROM territory.territories AS tt WHERE (tt._id = ANY(agg.ancestors) OR tt._id = agg._id) and tt.level = 'region') as region,
    (SELECT array_agg(tt.name) FROM territory.territories AS tt WHERE (tt._id = ANY(agg.ancestors) OR tt._id = agg._id) and tt.level = 'state') as state,
    (SELECT array_agg(tt.name) FROM territory.territories AS tt WHERE (tt._id = ANY(agg.ancestors) OR tt._id = agg._id) and tt.level = 'town') as town,
    (SELECT array_agg(tt.name) FROM territory.territories AS tt WHERE (tt._id = ANY(agg.ancestors) OR tt._id = agg._id) and tt.level = 'towngroup') as towngroup
  FROM mig.agg;

SELECT 'bc_array' as name, count(*) from mig.bc_array;

-- fast
INSERT INTO territory.territories_view (
    _id,
    active,
    activable,
    level,
    parent,
    children,
    ancestors,
    descendants,
    insee,
    postcode,
    codedep,
    breadcrumb
  )
    SELECT
      a._id::int,
      t.active::boolean,
      t.activable::boolean,
      t.level::territory.territory_level_enum,
      (a.ancestors[array_length(a.ancestors, 1)])::int as parent,
      a.children::int[],
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

  FROM mig.agg AS a
  LEFT JOIN territory.territories AS t ON t._id = a._id
  LEFT JOIN mig.bc_array AS bc ON bc.territory_id = a._id
  ON CONFLICT DO NOTHING;

SELECT 'view' as name, count(*) from territory.territories_view;

DROP SCHEMA mig CASCADE;
