
DROP FUNCTION IF EXISTS territory.get_territory_view_data;

CREATE OR REPLACE FUNCTION territory.get_territory_view_data(ids int[]) RETURNS TABLE(
    _id int,
    active boolean,
    activable boolean,
    level territory.territory_level_enum,
    parent int,
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

     where t._id = ANY(ids)
    GROUP BY t._id
   
  )
  ,codes AS (
    SELECT
    territory_id,
    array_remove(array_agg(tc.value) FILTER(where tc.type = 'insee'), null) AS insee,
    array_remove(array_agg(tc.value) FILTER(where tc.type = 'postcode'), null) AS postcode,
    array_remove(array_agg(tc.value) FILTER(where tc.type = 'codedep'), null) AS codedep
    
FROM territory.territory_codes tc WHERE tc.territory_id = ANY(ids) GROUP BY tc.territory_id
  )
  ,input AS (
    SELECT 
      r._id,
      r.parents,
      r.children,
      d.insee,
      d.postcode,
      d.codedep
    FROM root AS r 
    LEFT JOIN codes AS d 
      ON r._id = d.territory_id 
    ORDER BY coalesce(array_length(r.children,1),0) ASC
  )
  ,complete_parent AS (
    SELECT t._id, t.parents FROM input AS t 
    UNION ALL 
    SELECT
      c._id,
      t.parents AS parents
    FROM input AS t 
    JOIN complete_parent AS c ON t._id = any(c.parents)
  )
  ,complete_children AS (
    SELECT t._id, t.children,t.insee,t.postcode,t.codedep FROM input AS t 
    UNION ALL 
    SELECT 
      c._id,
      t.children AS children,
      t.insee,
      t.postcode,
      t.codedep
    FROM input AS t 
    JOIN complete_children AS c ON t._id = any(c.children)
  )
  ,complete as (
       SELECT 
        cc._id,
        cc.children,
        cc.insee,
        cc.postcode,
        cc.codedep,
        cp.parents 
        
        FROM complete_children AS cc
       LEFT JOIN complete_parent cp ON cp._id = cc._id
  )
  ,agg AS (
    SELECT
        c._id,
        array_remove(array_remove(array_agg(distinct p), null), c._id) AS ancestors,
        array_remove(array_remove(array_agg(distinct b), null), c._id) AS descendants,
        array_remove(array_agg(distinct ins), null) AS insee,
        array_remove(array_agg(distinct pos), null) AS postcode,
        array_remove(array_agg(distinct cdp), null) AS codedep,
        array_remove(array_agg(distinct tr.child_territory_id), null)  AS children
        
    FROM complete AS c
    left JOIN unnest(c.parents) AS p ON true
    left JOIN unnest(c.children) AS b ON true 
    left JOIN unnest(c.insee) AS ins ON true 
    left JOIN unnest(c.postcode) AS pos ON true
    left JOIN unnest(c.codedep) AS cdp ON true
    left JOIN territory.territory_relation AS tr ON (tr.parent_territory_id = c._id)

    GROUP BY c._id
  )
  
  ,bc_array AS (
    SELECT 
    agg._id as territory_id,
    agg.ancestors
    
    ,(SELECT array_agg(tt.name) FROM territory.territories AS tt WHERE (tt._id = ANY(agg.ancestors) OR tt._id = agg._id) and tt.level = 'country') as country
    ,(SELECT array_agg(tt.name) FROM territory.territories AS tt WHERE (tt._id = ANY(agg.ancestors) OR tt._id = agg._id) and tt.level = 'countrygroup') as countrygroup
    ,(SELECT array_agg(tt.name) FROM territory.territories AS tt WHERE (tt._id = ANY(agg.ancestors) OR tt._id = agg._id) and tt.level = 'district') as district
    ,(SELECT array_agg(tt.name) FROM territory.territories AS tt WHERE (tt._id = ANY(agg.ancestors) OR tt._id = agg._id) and tt.level = 'megalopolis') as megalopolis
    ,(SELECT array_agg(tt.name) FROM territory.territories AS tt WHERE (tt._id = ANY(agg.ancestors) OR tt._id = agg._id) and tt.level = 'other') as other
    ,(SELECT array_agg(tt.name) FROM territory.territories AS tt WHERE (tt._id = ANY(agg.ancestors) OR tt._id = agg._id) and tt.level = 'region') as region
    ,(SELECT array_agg(tt.name) FROM territory.territories AS tt WHERE (tt._id = ANY(agg.ancestors) OR tt._id = agg._id) and tt.level = 'state') as state
    ,(SELECT array_agg(tt.name) FROM territory.territories AS tt WHERE (tt._id = ANY(agg.ancestors) OR tt._id = agg._id) and tt.level = 'town') as town
    ,(SELECT array_agg(tt.name) FROM territory.territories AS tt WHERE (tt._id = ANY(agg.ancestors) OR tt._id = agg._id) and tt.level = 'towngroup') as towngroup

    FROM agg
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

    FROM agg AS a
    LEFT JOIN territory.territories AS t ON t._id = a._id
    LEFT JOIN bc_array AS bc ON bc.territory_id = a._id;


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
        parent = tv.ancestors[array_length(tv.ancestors, 1)],
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
    FROM
    tv
    WHERE
    territory.territories_view._id = tv._id;

    RETURN;
END
$$ LANGUAGE plpgsql;
