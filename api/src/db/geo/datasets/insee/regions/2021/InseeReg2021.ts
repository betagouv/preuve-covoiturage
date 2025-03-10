import { AbstractDataset } from "../../../../common/AbstractDataset.ts";
import { ArchiveFileTypeEnum, FileTypeEnum, StaticAbstractDataset } from "../../../../interfaces/index.ts";

export class InseeReg2021 extends AbstractDataset {
  static producer = "insee";
  static dataset = "reg";
  static year = 2021;
  static table = "insee_reg_2021";
  static url = "https://www.insee.fr/fr/statistiques/fichier/5057840/region2021-csv.zip";
  static sha256 = "5fc418c45b2e3faea6ae91540d4da6baaec125dabf18085924cc31b33c3b01f5";

  readonly fileArchiveType: ArchiveFileTypeEnum = ArchiveFileTypeEnum.Zip;
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
    AND a.year IN (2019,2020, ${(this.constructor as StaticAbstractDataset).year});
  `;
}
