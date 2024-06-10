import { EurostatCountries2020 } from "../../../eurostat/countries/2020/EurostatCountries2020.ts";
import { EurostatSimplifiedCountries2020 } from "../../../eurostat/countries/2020/EurostatSimplifiedCountries2020.ts";
import { AbstractDataset } from "../../../../common/AbstractDataset.ts";
import {
  ArchiveFileTypeEnum,
  FileTypeEnum,
  StateManagerInterface,
} from "../../../../interfaces/index.ts";

export class InseePays2021 extends AbstractDataset {
  static producer = "insee";
  static dataset = "pays";
  static year = 2021;
  static table = "insee_pays_2021";
  static url =
    "https://www.insee.fr/fr/statistiques/fichier/5057840/pays2021-csv.zip";

  readonly fileArchiveType: ArchiveFileTypeEnum = ArchiveFileTypeEnum.Zip;
  readonly rows: Map<string, [string, string]> = new Map([
    ["cog", ["0", "varchar(5)"]],
    ["actual", ["1", "varchar(1)"]],
    ["capay", ["2", "varchar"]],
    ["crpay", ["3", "varchar"]],
    ["ani", ["4", "varchar"]],
    ["libcog", ["5", "varchar"]],
    ["libenr", ["6", "varchar"]],
    ["ancnom", ["7", "varchar"]],
    ["codeiso2", ["8", "varchar"]],
    ["codeiso3", ["9", "varchar"]],
    ["codenum3", ["10", "varchar"]],
  ]);
  readonly extraBeforeSql =
    `ALTER TABLE ${this.tableWithSchema} ALTER COLUMN cog SET NOT NULL;`;

  fileType: FileTypeEnum = FileTypeEnum.Csv;
  sheetOptions = {};

  readonly importSql = `
    INSERT INTO ${this.targetTableWithSchema} (
      year,
      centroid,
      geom,
      geom_simple,
      surface,
      arr,
      l_arr,
      country,
      l_country
    ) SELECT
      2021 as year,
      ST_PointOnSurface(t.geom) as centroid,
      t.geom,
      t2.geom as geom_simple,
      st_area(t.geom::geography)/1000000 as surface,
      a.cog,
      a.libcog,
      a.cog,
      a.libcog
    FROM ${this.tableWithSchema} AS a
    JOIN ${this.targetSchema}.${EurostatCountries2020.table} AS t
    ON a.codeiso3 = t.codeiso3
    JOIN ${this.targetSchema}.${EurostatSimplifiedCountries2020.table} AS t2
    ON a.codeiso3 = t2.codeiso3
    ON CONFLICT DO NOTHING;
  `;

  async validate(state: StateManagerInterface) {
    state.plan([EurostatCountries2020]);
    state.plan([EurostatSimplifiedCountries2020]);
  }
}
