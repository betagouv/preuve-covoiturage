CREATE EXTENSION IF NOT EXISTS tablefunc;

DROP MATERIALIZED VIEW IF EXISTS territory.territories_view;

CREATE MATERIALIZED VIEW territory.territories_view AS (
WITH RECURSIVE
  root AS (
    SELECT
      t._id,
      array_remove(
        array_agg(
          distinct tr.parent_territory_id
        ),
        t._id
      ) AS parents,
      array_remove(
        array_agg(
            distinct tr.child_territory_id
        ),
        t._id
      ) AS children 
    FROM territory.territories AS t 
    LEFT JOIN territory.territory_relation AS tr 
      ON t._id = tr.parent_territory_id 
      OR t._id = tr.child_territory_id
    GROUP BY t._id
  ),
  codes AS (
    SELECT
      territory_id,
      array_remove(array_agg(insee), null) AS insee,
      array_remove(array_agg(postcode),null) AS postcode 
    FROM crosstab(
      'SELECT territory_id, type, value FROM territory.territory_codes order by type asc',
      'SELECT distinct type FROM territory.territory_codes order by type asc'
    ) AS (territory_id int, "insee" varchar, "postcode" varchar)
    GROUP BY territory_id
  ),
  input AS (
    SELECT 
      r._id,
      r.parents,
      r.children,
      d.insee,
      d.postcode
    FROM root AS r 
    LEFT JOIN codes AS d 
      ON r._id = d.territory_id 
    ORDER BY coalesce(array_length(children,1),0) ASC
  ),
  complete_parent AS (
    SELECT t._id, t.parents FROM input AS t 
    UNION ALL 
    SELECT 
      c._id,
      t.parents AS parents
    FROM input AS t 
    JOIN complete_parent AS c ON t._id = any(c.parents)
  ),
  complete_children AS (
    SELECT t._id, t.children,t.insee,t.postcode FROM input AS t 
    UNION ALL 
    SELECT 
      c._id,
      t.children AS children,
      t.insee,
      t.postcode
    FROM input AS t 
    JOIN complete_children AS c ON t._id = any(c.children)
  ),
  complete as (
       SELECT cc._id, cc.children,cc.insee,cc.postcode,cp.parents FROM complete_children AS cc
       LEFT JOIN complete_parent cp ON cp._id = cc._id
  ),
  agg AS (
    SELECT
        c._id,
        array_remove(array_remove(array_agg(distinct p), null), c._id) AS ancestors,
        array_remove(array_remove(array_agg(distinct b), null), c._id) AS descendants,
        array_remove(array_agg(distinct ins), null) AS insee,
        array_remove(array_agg(distinct pos), null) AS postcode
        
    FROM complete AS c
    left JOIN unnest(c.parents) AS p ON true
    left JOIN unnest(c.children) AS b ON true 
    left JOIN unnest(c.insee) AS ins ON true 
    left JOIN unnest(c.postcode) AS pos ON true
    GROUP BY c._id
  )
  SELECT
    a._id,
    t.active,
    t.level,
    -- ADD
    -- - all level above (town, intertown, etc.)
    -- - direct_children, direct_parent (or rename parents to ancestors, children to descendants)
    -- - latest_children/ending_children,
    -- - active_children,
    -- - merge geo ?
    a.ancestors,
    a.descendants,
    a.insee,
    a.postcode
  FROM agg AS a
  left JOIN territory.territories AS t ON t._id = a._id
  
);

CREATE INDEX IF NOT EXISTS territory_territories_view_id_idx ON territory.territories_view(_id);
