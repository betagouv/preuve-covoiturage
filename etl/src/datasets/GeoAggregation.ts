import { AbstractDatatreatment } from '@betagouvpdc/evolution-geo/dist/common/AbstractDatatreatment';

export class GeoAggregation extends AbstractDatatreatment {
  static uuid = 'populate_geo_aggregation';
  static year = 2024;
  static table = 'perimeters_aggregate';
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
    geom_simple
    FROM geo.${this.targetTable}
    WHERE com IS NOT NULL
    UNION
    SELECT year, 
    'epci',
    epci,
    l_epci,
    st_multi(st_union(geom_simple))
    FROM geo.${this.targetTable}
    WHERE epci IS NOT NULL
    GROUP BY year, epci, l_epci
    UNION
    SELECT year,
    'aom',
    aom,
    l_aom,
    st_multi(st_union(geom_simple))
    FROM geo.${this.targetTable}
    WHERE aom IS NOT NULL
    GROUP BY year,aom,l_aom
    UNION
    SELECT year,
    'dep',
    dep,
    l_dep,
    st_multi(st_union(geom_simple))
    FROM geo.${this.targetTable}
    WHERE dep IS NOT NULL
    GROUP BY year,dep,l_dep
    UNION
    SELECT year,
    'reg',
    reg,
    l_reg,
    st_multi(st_union(geom_simple))
    FROM geo.${this.targetTable}
    WHERE reg IS NOT NULL
    GROUP BY year,reg,l_reg
    UNION
    SELECT distinct on (year,country) 
    year,
    'country',
    country,
    l_country,
    st_multi(st_union(geom_simple))
    FROM geo.${this.targetTable}
    GROUP BY year,country,l_country
    ON CONFLICT 
    ON CONSTRAINT ${this.table}_unique_key
    DO NOTHING;
  `;
}