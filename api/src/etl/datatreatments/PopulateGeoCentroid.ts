import { AbstractDatatreatment } from '../common/AbstractDatatreatment.js';

export class PopulateGeoCentroid extends AbstractDatatreatment {
  static uuid = 'populate_geo_centroid';
  static year = 2019;
  static table = 'perimeters_centroid';
  readonly sql = `
    INSERT INTO ${this.tableWithSchema} (
      year,
      type,
      territory,
      l_territory,
      geom
    )
    SELECT year,
    'com',
    arr,
    l_arr,
    centroid
    FROM ${this.targetTableWithSchema}
    WHERE com IS NOT NULL
    UNION
    SELECT year, 
    'epci',
    epci,
    l_epci,
    ST_PointOnSurface(st_union(geom_simple))
    FROM ${this.targetTableWithSchema}
    WHERE epci IS NOT NULL
    GROUP BY year, epci, l_epci
    UNION
    SELECT year,
    'aom',
    aom,
    l_aom,
    ST_PointOnSurface(st_union(geom_simple))
    FROM ${this.targetTableWithSchema}
    WHERE aom IS NOT NULL
    GROUP BY year,aom,l_aom
    UNION
    SELECT year,
    'dep',
    dep,
    l_dep,
    ST_PointOnSurface(st_union(geom_simple))
    FROM ${this.targetTableWithSchema}
    WHERE dep IS NOT NULL
    GROUP BY year,dep,l_dep
    UNION
    SELECT year,
    'reg',
    reg,
    l_reg,
    ST_PointOnSurface(st_union(geom_simple))
    FROM ${this.targetTableWithSchema}
    WHERE reg IS NOT NULL
    GROUP BY year,reg,l_reg
    UNION
    SELECT distinct on (year,country) 
    year,
    'country',
    country,
    l_country,
    ST_PointOnSurface(st_union(geom_simple))
    FROM ${this.targetTableWithSchema}
    WHERE country <> 'XXXXX'
    GROUP BY year,country,l_country
    UNION
    SELECT year,
    'country',
    country,
    l_country,
    centroid
    FROM ${this.targetTableWithSchema}
    WHERE arr = '75056'
    ON CONFLICT 
    ON CONSTRAINT ${this.table}_unique_key
    DO NOTHING;
  `;
}
