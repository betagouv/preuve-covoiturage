import { AbstractDataset } from '../../../../common/AbstractDataset.js';
import { StaticAbstractDataset, ArchiveFileTypeEnum, FileTypeEnum } from '../../../../interfaces/index.js';

export class InseeReg2021 extends AbstractDataset {
  static producer = 'insee';
  static dataset = 'reg';
  static year = 2021;
  static table = 'insee_reg_2021';
  static url = 'https://www.insee.fr/fr/statistiques/fichier/5057840/region2021-csv.zip';

  readonly fileArchiveType: ArchiveFileTypeEnum = ArchiveFileTypeEnum.Zip;
  readonly rows: Map<string, [string, string]> = new Map([
    ['reg', ['0', 'varchar(2)']],
    ['chef_lieu', ['1', 'varchar(5)']],
    ['tncc', ['2', 'varchar']],
    ['ncc', ['3', 'varchar']],
    ['nccenr', ['4', 'varchar']],
    ['libelle', ['5', 'varchar']],
  ]);
  readonly extraBeforeSql = `ALTER TABLE ${this.tableWithSchema} ALTER COLUMN reg SET NOT NULL;`;

  fileType: FileTypeEnum = FileTypeEnum.Csv;
  sheetOptions = {};

  readonly tableIndex = 'reg';
  readonly importSql = `
    UPDATE ${this.targetTableWithSchema} AS a
    SET l_reg = t.libelle
    FROM ${this.tableWithSchema} t
    WHERE a.reg = t.reg
    AND a.year IN (2019,2020, ${(this.constructor as StaticAbstractDataset).year});
  `;
}
