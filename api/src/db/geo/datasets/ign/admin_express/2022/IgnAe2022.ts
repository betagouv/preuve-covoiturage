import { StaticAbstractDataset } from "../../../../interfaces/index.ts";
import { IgnDataset, TransformationParamsInterface } from "../../common/IgnDataset.ts";

export class IgnAe2022 extends IgnDataset {
  static producer = "ign";
  static dataset = "ae";
  static year = 2022;
  static table = "ign_ae_2022";

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
    CREATE INDEX IF NOT EXISTS ign_ae_2022_id_index ON ${this.tableWithSchema} USING btree (id);
    CREATE INDEX IF NOT EXISTS ign_ae_2022_geom_index ON ${this.tableWithSchema} USING gist (geom);
    CREATE INDEX IF NOT EXISTS ign_ae_2022_centroid_index ON ${this.tableWithSchema} USING gist (centroid);
    CREATE INDEX IF NOT EXISTS ign_ae_2022_geom_simple_index ON ${this.tableWithSchema} USING gist (geom_simple);
  `;
  // deno-fmt-ignore
  static url = "https://files.opendatarchives.fr/professionnels.ign.fr/adminexpress/ADMIN-EXPRESS-COG-CARTO_3-1__SHP__FRA_WM_2022-04-15.7z";
  static sha256 = "378dc955f0c955400c28d870d21a4318e78d728af00301716abb2913ff13a3c9";

  readonly transformations: Array<
    [string, Partial<TransformationParamsInterface>]
  > = [
    ["SHP_WGS84G_FRA/COMMUNE", { key: "geom" }],
    ["SHP_WGS84G_FRA/ARRONDISSEMENT_MUNICIPAL", { key: "geom" }],
    [
      "SHP_WGS84G_FRA/COMMUNE",
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
      "SHP_WGS84G_FRA/ARRONDISSEMENT_MUNICIPAL",
      {
        key: "geom_simple",
        simplify: [
          "-simplify 60% keep-shapes",
          "-simplify 50% keep-shapes",
          "-simplify 40% keep-shapes",
        ],
      },
    ],
    ["SHP_WGS84G_FRA/CHEF_LIEU_CARTO", { key: "centroid" }],
    ["SHP_WGS84G_FRA/CHFLIEU_ARRONDISSEMENT_MUNICIPAL", { key: "centroid" }],
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
