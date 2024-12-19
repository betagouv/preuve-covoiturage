import { AbstractDataset } from "../../../../common/AbstractDataset.ts";
import { ArchiveFileTypeEnum, FileTypeEnum, StaticAbstractDataset } from "../../../../interfaces/index.ts";

export class InseeCom2021 extends AbstractDataset {
  static producer = "insee";
  static dataset = "com";
  static year = 2021;
  static table = "insee_com_2021";
  static url = "https://www.insee.fr/fr/statistiques/fichier/5057840/commune2021-csv.zip";
  static sha256 = "67a88da9061609c861b20aa853f5480d1fcdc8431e3911ae6c6c03cc925febd7";

  readonly fileArchiveType: ArchiveFileTypeEnum = ArchiveFileTypeEnum.Zip;
  readonly rows: Map<string, [string, string]> = new Map([
    ["typecom", ["0", "varchar(4)"]],
    ["arr", ["1", "varchar(5)"]],
    ["libelle", ["9", "varchar"]],
    ["com", ["11", "varchar(5)"]],
  ]);

  override readonly extraBeforeSql = `ALTER TABLE ${this.tableWithSchema} ALTER COLUMN arr SET NOT NULL;`;

  fileType: FileTypeEnum = FileTypeEnum.Csv;
  override sheetOptions = {};

  override readonly tableIndex = "arr";
  override readonly importSql = `
    UPDATE ${this.targetTableWithSchema} AS a
      SET l_arr = t.libelle, com = t.com
    FROM ${this.tableWithSchema} t
    WHERE a.arr = t.arr AND t.typecom = 'ARM'
    AND a.year = ${(this.constructor as StaticAbstractDataset).year};
  `;
}
