import { AbstractDataset } from '../../../../common/AbstractDataset.js';
import { StaticAbstractDataset, ArchiveFileTypeEnum, FileTypeEnum } from '../../../../interfaces/index.js';

export class InseeDep2023 extends AbstractDataset {
  static producer = 'insee';
  static dataset = 'dep';
  static year = 2023;
  static table = 'insee_dep_2023';
  static url = 'https://www.insee.fr/fr/statistiques/fichier/6800675/v_departement_2023.csv';

  readonly fileArchiveType: ArchiveFileTypeEnum = ArchiveFileTypeEnum.None;
  readonly rows: Map<string, [string, string]> = new Map([
    ['dep', ['0', 'varchar(3)']],
    ['reg', ['1', 'varchar(2)']],
    ['chef_lieu', ['2', 'varchar(5)']],
    ['tncc', ['3', 'varchar']],
    ['ncc', ['4', 'varchar']],
    ['nccenr', ['5', 'varchar']],
    ['libelle', ['6', 'varchar']],
  ]);

  readonly extraBeforeSql = `ALTER TABLE ${this.tableWithSchema} ALTER COLUMN dep SET NOT NULL;`;

  fileType: FileTypeEnum = FileTypeEnum.Csv;
  sheetOptions = {};

  readonly tableIndex = 'dep';
  readonly importSql = `
    UPDATE ${this.targetTableWithSchema} AS a
      SET l_dep = t.libelle
    FROM ${this.tableWithSchema} t
    WHERE a.dep = t.dep
    AND a.year = ${(this.constructor as StaticAbstractDataset).year};
  `;
}
