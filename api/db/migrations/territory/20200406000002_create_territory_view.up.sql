CREATE MATERIALIZED VIEW territory.territories_view AS (
WITH RECURSIVE
  root AS (
    SELECT
      t._id,
      array_remove(
        array_agg(
          distinct (
            CASE 
              WHEN tr.parent_territory_id = t._id
              THEN null
              ELSE tr.parent_territory_id
            END
          )
        ),
        null
      ) AS parents,
      array_remove(
        array_agg(
          distinct (
            CASE 
              WHEN tr.child_territory_id = t._id 
              THEN null 
              ELSE tr.child_territory_id
            END
          )
        ),
        null
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
  complete AS (
    SELECT * FROM input AS t 
    UNION ALL 
    SELECT 
      c._id,
      t.parents AS parents,
      t.children AS children,
      t.insee,
      t.postcode
    FROM input AS t 
    JOIN complete AS c ON t._id = any(c.children)
  ),
  agg AS (
    SELECT
        c._id,
        array_remove(array_remove(array_agg(distinct p), null), c._id) AS parents,
        array_remove(array_remove(array_agg(distinct b), null), c._id) AS children,
        array_remove(array_agg(distinct ins), null) AS insee,
        array_remove(array_agg(distinct pos), null) AS postcode,
        array_agg(ROW(tt.level, tt.name)::territory.territory_level_name) AS parent_level_name
    FROM complete AS c
    left JOIN unnest(c.parents) AS p ON true
    left JOIN unnest(c.children) AS b ON true 
    left JOIN unnest(c.insee) AS ins ON true 
    left JOIN unnest(c.postcode) AS pos ON true
    left JOIN territory.territories as tt ON tt._id = ANY(c.parents)
    GROUP BY c._id
  )
  SELECT
    a._id,
    t.active,
    t.level,
    a.parent_level_name,
    -- ADD
    -- - all level above (town, intertown, etc.)
    -- - direct_children, direct_parent (or rename parents to ancestors, children to descendants)
    -- - latest_children/ending_children,
    -- - active_children,
    -- - merge geo ?
    a.parents,
    a.children,
    a.insee,
    a.postcode
  FROM agg AS a
  left JOIN territory.territories AS t ON t._id = a._id
);

CREATE INDEX IF NOT EXISTS territory_territories_view_id_idx ON territory.territories_view(_id);
