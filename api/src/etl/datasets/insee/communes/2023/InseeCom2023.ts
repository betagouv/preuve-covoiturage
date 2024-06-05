import { AbstractDataset } from '../../../../common/AbstractDataset.ts';
import { StaticAbstractDataset, ArchiveFileTypeEnum, FileTypeEnum } from '../../../../interfaces/index.ts';

export class InseeCom2023 extends AbstractDataset {
  static producer = 'insee';
  static dataset = 'com';
  static year = 2023;
  static table = 'insee_com_2023';
  static url = 'https://www.insee.fr/fr/statistiques/fichier/6800675/v_commune_2023.csv';

  readonly fileArchiveType: ArchiveFileTypeEnum = ArchiveFileTypeEnum.None;
  readonly rows: Map<string, [string, string]> = new Map([
    ['typecom', ['0', 'varchar(4)']],
    ['arr', ['1', 'varchar(5)']],
    ['libelle', ['9', 'varchar']],
    ['com', ['11', 'varchar(5)']],
  ]);

  readonly extraBeforeSql = `ALTER TABLE ${this.tableWithSchema} ALTER COLUMN arr SET NOT NULL;`;

  fileType: FileTypeEnum = FileTypeEnum.Csv;
  sheetOptions = {};

  readonly tableIndex = 'arr';
  readonly importSql = `
    UPDATE ${this.targetTableWithSchema} AS a
      SET l_arr = t.libelle, com = t.com
    FROM ${this.tableWithSchema} t
    WHERE a.arr = t.arr AND t.typecom = 'ARM'
    AND a.year = ${(this.constructor as StaticAbstractDataset).year};
  `;
}
