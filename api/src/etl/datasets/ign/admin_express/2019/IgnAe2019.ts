import {
  IgnDataset,
  TransformationParamsInterface,
} from "../../common/IgnDataset.ts";
import { StaticAbstractDataset } from "../../../../interfaces/index.ts";

export class IgnAe2019 extends IgnDataset {
  static producer = "ign";
  static dataset = "ae";
  static year = 2019;
  static table = "ign_ae_2019";

  readonly beforeSql: string = `
    CREATE TABLE IF NOT EXISTS ${this.tableWithSchema} (
      id SERIAL PRIMARY KEY,
      com varchar(5) NOT NULL,
      pop integer,
      geom geometry(MULTIPOLYGON,4326),
      centroid GEOMETRY(POINT, 4326),
      geom_simple GEOMETRY(MULTIPOLYGON, 4326)
    );
    CREATE INDEX IF NOT EXISTS ign_ae_2019_id_index ON ${this.tableWithSchema} USING btree (id);
    CREATE INDEX IF NOT EXISTS ign_ae_2019_geom_index ON ${this.tableWithSchema} USING gist (geom);
    CREATE INDEX IF NOT EXISTS ign_ae_2019_centroid_index ON ${this.tableWithSchema} USING gist (centroid);
    CREATE INDEX IF NOT EXISTS ign_ae_2019_geom_simple_index ON ${this.tableWithSchema} USING gist (geom_simple);
  `;
  static url =
    // eslint-disable-next-line max-len
    "http://files.opendatarchives.fr/professionnels.ign.fr/adminexpress/ADMIN-EXPRESS-COG_2-0__SHP__FRA_WGS84G_2019-09-24.7z";

  readonly transformations: Array<
    [string, Partial<TransformationParamsInterface>]
  > = [
    ["SHP_WGS84_FR/COMMUNE.shp", { key: "geom" }],
    ["SHP_WGS84_FR/COMMUNE_CARTO.shp", {
      key: "geom_simple",
      simplify: ["-simplify dp interval=100 keep-shapes"],
    }],
    ["SHP_WGS84_FR/CHEF_LIEU_CARTO.shp", { key: "centroid" }],
  ];

  readonly importSql = `
    INSERT INTO ${this.targetTableWithSchema} (
      year,
      centroid,
      geom,
      geom_simple,
      surface,
      arr,
      pop,
      country,
      l_country
    ) SELECT
      ${(this.constructor as StaticAbstractDataset).year} as year,
      centroid,
      geom,
      geom_simple,
      st_area(geom::geography)/1000000 as surface,
      com,
      pop,
      'XXXXX' as country,
      'France' as l_country
    FROM ${this.tableWithSchema}
    ON CONFLICT DO NOTHING;
  `;
}
