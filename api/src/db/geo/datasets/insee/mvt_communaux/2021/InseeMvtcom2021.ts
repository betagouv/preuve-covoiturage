import { AbstractDataset } from "../../../../common/AbstractDataset.ts";
import { ArchiveFileTypeEnum, FileTypeEnum } from "../../../../interfaces/index.ts";

export class InseeMvtcom2021 extends AbstractDataset {
  static producer = "insee";
  static dataset = "mvtcom";
  static year = 2021;
  static table = "insee_mvtcom_2021";
  override readonly targetTable = "com_evolution";
  static url = "https://www.insee.fr/fr/statistiques/fichier/5057840/mvtcommune2021-csv.zip";
  static sha256 = "63742e6f3b8adc36bd0eb1a56452bae9fccc3090dd43a4606ad4f222f88906f5";

  readonly fileArchiveType: ArchiveFileTypeEnum = ArchiveFileTypeEnum.Zip;
  readonly rows: Map<string, [string, string]> = new Map([
    ["mod", ["0", "smallint"]],
    ["date_eff", ["1", "varchar"]],
    ["typecom_av", ["2", "varchar"]],
    ["com_av", ["3", "varchar"]],
    ["typecom_ap", ["8", "varchar"]],
    ["com_ap", ["9", "varchar"]],
  ]);

  override readonly extraBeforeSql = `ALTER TABLE ${this.tableWithSchema} ALTER COLUMN mod SET NOT NULL;`;

  fileType: FileTypeEnum = FileTypeEnum.Csv;
  override sheetOptions = {};

  override readonly importSql = `
    INSERT INTO ${this.targetTableWithSchema} (
      year,
      mod,
      old_com,
      new_com,
      l_mod
    ) SELECT
      date_part('year',date_eff::date)::int as year,
      mod,
      com_av,
      com_ap,
      CASE WHEN mod = 20 THEN 'création'
      WHEN mod = 21 THEN 'rétablissement'
      WHEN mod = 30 THEN 'suppression'
      WHEN mod = 31 THEN 'fusion simple'
      WHEN mod = 32 THEN 'création de commune nouvelle'
      WHEN mod = 33 THEN 'fusion association'
      WHEN mod = 41 THEN 'Changement de code dû à un changement de département'
      WHEN mod = 50 THEN 'Changement de code dû à un transfert de chef-lieu'
      END::varchar as libelle_mod
    FROM ${this.tableWithSchema} 
    WHERE (date_eff::date >= '2019-01-01')
    AND mod in (20,21,30,31,32,33,41,50)
    AND typecom_ap = 'COM'
    AND typecom_av = 'COM'
    ORDER BY date_eff,com_ap
    ON CONFLICT DO NOTHING;
  `;
}
