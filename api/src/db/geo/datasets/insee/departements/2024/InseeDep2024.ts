import { AbstractDataset } from "../../../../common/AbstractDataset.ts";
import { ArchiveFileTypeEnum, FileTypeEnum, StaticAbstractDataset } from "../../../../interfaces/index.ts";

export class InseeDep2024 extends AbstractDataset {
  static producer = "insee";
  static dataset = "dep";
  static year = 2024;
  static table = "insee_dep_2024";
  static url = "https://www.insee.fr/fr/statistiques/fichier/7766585/v_departement_2024.csv";
  static sha256 = "513900ca23edc682ef9b912d7bfc317129eac3a7d71ff19bc22b40ea4838e6eb";

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
