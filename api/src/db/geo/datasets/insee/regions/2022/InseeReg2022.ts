import { AbstractDataset } from "../../../../common/AbstractDataset.ts";
import { ArchiveFileTypeEnum, FileTypeEnum, StaticAbstractDataset } from "../../../../interfaces/index.ts";

export class InseeReg2022 extends AbstractDataset {
  static producer = "insee";
  static dataset = "reg";
  static year = 2022;
  static table = "insee_reg_2022";
  static url = "https://www.insee.fr/fr/statistiques/fichier/6051727/region_2022.csv";
  static sha256 = "b4aa83b414bc49eef65c1c5fd31df28dfb9d8d9c2574b0ed220346aec5ad6f30";

  readonly fileArchiveType: ArchiveFileTypeEnum = ArchiveFileTypeEnum.None;
  readonly rows: Map<string, [string, string]> = new Map([
    ["reg", ["0", "varchar(2)"]],
    ["chef_lieu", ["1", "varchar(5)"]],
    ["tncc", ["2", "varchar"]],
    ["ncc", ["3", "varchar"]],
    ["nccenr", ["4", "varchar"]],
    ["libelle", ["5", "varchar"]],
  ]);
  override readonly extraBeforeSql = `ALTER TABLE ${this.tableWithSchema} ALTER COLUMN reg SET NOT NULL;`;

  fileType: FileTypeEnum = FileTypeEnum.Csv;
  override sheetOptions = {};

  override readonly tableIndex = "reg";
  override readonly importSql = `
    UPDATE ${this.targetTableWithSchema} AS a
    SET l_reg = t.libelle
    FROM ${this.tableWithSchema} t
    WHERE a.reg = t.reg
    AND a.year = ${(this.constructor as StaticAbstractDataset).year};
  `;
}
