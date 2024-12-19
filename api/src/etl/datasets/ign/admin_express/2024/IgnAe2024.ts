import { StaticAbstractDataset } from "../../../../interfaces/index.ts";
import { IgnDataset, TransformationParamsInterface } from "../../common/IgnDataset.ts";

export class IgnAe2024 extends IgnDataset {
  static producer = "ign";
  static dataset = "ae";
  static year = 2024;
  static table = "ign_ae_2024";

  override readonly rows: Map<string, [string, string]> = new Map([
    ["arr", ["INSEE_ARM", "varchar"]],
    ["com", ["INSEE_COM", "varchar"]],
    ["pop", ["POPULATION", "integer"]],
  ]);

  override readonly beforeSql: string = `
    CREATE TABLE IF NOT EXISTS ${this.tableWithSchema} (
      id SERIAL PRIMARY KEY,
      arr varchar(5),
      com varchar(5) NOT NULL,
      pop integer,
      geom geometry(MULTIPOLYGON,4326),
      centroid GEOMETRY(POINT, 4326),
      geom_simple GEOMETRY(MULTIPOLYGON, 4326)
    );
    CREATE INDEX IF NOT EXISTS ign_ae_2024_id_index ON ${this.tableWithSchema} USING btree (id);
    CREATE INDEX IF NOT EXISTS ign_ae_2024_geom_index ON ${this.tableWithSchema} USING gist (geom);
    CREATE INDEX IF NOT EXISTS ign_ae_2024_centroid_index ON ${this.tableWithSchema} USING gist (centroid);
    CREATE INDEX IF NOT EXISTS ign_ae_2024_geom_simple_index ON ${this.tableWithSchema} USING gist (geom_simple);
  `;
  // deno-fmt-ignore
  static url = "http://files.opendatarchives.fr/professionnels.ign.fr/adminexpress/ADMIN-EXPRESS-COG-CARTO_3-2__SHP_WGS84G_FRA_2024-02-22.7z";
  static sha256 = "7800572c3c3bf03b73d072178d9ffd0fd998be5a2d5be67bde26b8b4c22b1eea";

  override readonly transformations: Array<
    [string, Partial<TransformationParamsInterface>]
  > = [
    ["SHP_WGS84G_FRA-ED2024-02-22/COMMUNE.shp", { key: "geom" }],
    ["SHP_WGS84G_FRA-ED2024-02-22/ARRONDISSEMENT_MUNICIPAL.shp", {
      key: "geom",
    }],
    [
      "SHP_WGS84G_FRA-ED2024-02-22/COMMUNE.shp",
      {
        key: "geom_simple",
        simplify: [
          "-simplify 60% keep-shapes",
          "-simplify 50% keep-shapes",
          "-simplify 40% keep-shapes",
        ],
      },
    ],
    [
      "SHP_WGS84G_FRA-ED2024-02-22/ARRONDISSEMENT_MUNICIPAL.shp",
      {
        key: "geom_simple",
        simplify: [
          "-simplify 60% keep-shapes",
          "-simplify 50% keep-shapes",
          "-simplify 40% keep-shapes",
        ],
      },
    ],
    ["SHP_WGS84G_FRA-ED2024-02-22/CHFLIEU_ARRONDISSEMENT_MUNICIPAL.shp", {
      key: "centroid",
    }],
  ];

  override readonly importSql = `
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
      centroid as centroid,
      geom as geom,
      geom_simple as geom_simple,
      st_area(geom::geography)/1000000 as surface,
      CASE WHEN arr IS NOT NULL THEN arr ELSE com END as arr,
      pop as pop,
      'XXXXX' as country,
      'France' as l_country
    FROM ${this.tableWithSchema}
    ON CONFLICT DO NOTHING;
  `;
}
