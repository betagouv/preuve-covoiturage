import { AbstractDataset } from "../../../../common/AbstractDataset.ts";
import { ArchiveFileTypeEnum, FileTypeEnum, StaticAbstractDataset } from "../../../../interfaces/index.ts";

export class InseeDep2021 extends AbstractDataset {
  static producer = "insee";
  static dataset = "dep";
  static year = 2021;
  static table = "insee_dep_2021";
  static url = "https://www.insee.fr/fr/statistiques/fichier/5057840/departement2021-csv.zip";
  static sha256 = "55b0999478a2992566743dcd3560ed4be4dda01349574240fce1c37fa6fd0587";

  readonly fileArchiveType: ArchiveFileTypeEnum = ArchiveFileTypeEnum.Zip;
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
    AND a.year IN (2019,2020, ${(this.constructor as StaticAbstractDataset).year});
  `;
}
