import { AbstractDataset } from "../../../../common/AbstractDataset.ts";
import { ArchiveFileTypeEnum, FileTypeEnum, StateManagerInterface } from "../../../../interfaces/index.ts";
import { EurostatCountries2024 } from "../../../eurostat/countries/2024/EurostatCountries2024.ts";
import { EurostatSimplifiedCountries2024 } from "../../../eurostat/countries/2024/EurostatSimplifiedCountries2024.ts";

export class InseePays2024 extends AbstractDataset {
  static producer = "insee";
  static dataset = "pays";
  static year = 2024;
  static table = "insee_pays_2024";
  static url = "https://www.insee.fr/fr/statistiques/fichier/7766585/v_pays_territoire_2024.csv";
  static sha256 = "e27233f6206ceb932d97adbf4c1c054776ac1a23b767eb5289ec445120d0ecc6";

  readonly fileArchiveType: ArchiveFileTypeEnum = ArchiveFileTypeEnum.None;
  readonly rows: Map<string, [string, string]> = new Map([
    ["cog", ["0", "varchar(5)"]],
    ["actual", ["1", "varchar(1)"]],
    ["crpay", ["2", "varchar"]],
    ["ani", ["3", "varchar"]],
    ["libcog", ["4", "varchar"]],
    ["libenr", ["5", "varchar"]],
    ["codeiso2", ["6", "varchar"]],
    ["codeiso3", ["7", "varchar"]],
    ["codenum3", ["8", "varchar"]],
  ]);
  override readonly extraBeforeSql = `ALTER TABLE ${this.tableWithSchema} ALTER COLUMN cog SET NOT NULL;`;

  fileType: FileTypeEnum = FileTypeEnum.Csv;
  override sheetOptions = {};

  override readonly importSql = `
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
      2024 as year,
      ST_PointOnSurface(t.geom) as centroid,
      t.geom,
      t2.geom as geom_simple,
      st_area(t.geom::geography)/1000000 as surface,
      a.cog,
      a.libcog,
      a.cog,
      a.libcog
    FROM ${this.tableWithSchema} AS a
    JOIN ${this.targetSchema}.${EurostatCountries2024.table} AS t 
    ON a.codeiso3 = t.codeiso3
    JOIN ${this.targetSchema}.${EurostatSimplifiedCountries2024.table} AS t2
    ON a.codeiso3 = t2.codeiso3
    ON CONFLICT DO NOTHING;
  `;

  override async validate(state: StateManagerInterface) {
    state.plan([EurostatCountries2024]);
    state.plan([EurostatSimplifiedCountries2024]);
  }
}
