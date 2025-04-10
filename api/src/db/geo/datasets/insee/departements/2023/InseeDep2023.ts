import { AbstractDataset } from "../../../../common/AbstractDataset.ts";
import { ArchiveFileTypeEnum, FileTypeEnum, StaticAbstractDataset } from "../../../../interfaces/index.ts";

export class InseeDep2023 extends AbstractDataset {
  static producer = "insee";
  static dataset = "dep";
  static year = 2023;
  static table = "insee_dep_2023";
  static url = "https://www.insee.fr/fr/statistiques/fichier/6800675/v_departement_2023.csv";
  static sha256 = "ef783f7e88027dddbfa05b83c40a67d3f0f3894de165aace0acb118529eb97f7";

  readonly fileArchiveType: ArchiveFileTypeEnum = ArchiveFileTypeEnum.None;
  readonly rows: Map<string, [string, string]> = new Map([
    ["dep", ["0", "varchar(3)"]],
    ["reg", ["1", "varchar(2)"]],
    ["chef_lieu", ["2", "varchar(5)"]],
    ["tncc", ["3", "varchar"]],
    ["ncc", ["4", "varchar"]],
    ["nccenr", ["5", "varchar"]],
    ["libelle", ["6", "varchar"]],
  ]);

  override readonly extraBeforeSql = `ALTER TABLE ${this.tableWithSchema} ALTER COLUMN dep SET NOT NULL;`;

  fileType: FileTypeEnum = FileTypeEnum.Csv;
  override sheetOptions = {};

  override readonly tableIndex = "dep";
  override readonly importSql = `
    UPDATE ${this.targetTableWithSchema} AS a
      SET l_dep = t.libelle
    FROM ${this.tableWithSchema} t
    WHERE a.dep = t.dep
    AND a.year = ${(this.constructor as StaticAbstractDataset).year};
  `;
}
