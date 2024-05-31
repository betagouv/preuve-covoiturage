import { FileTypeEnum } from '../../../../interfaces/index.js';
import { InseePerimDataset } from '../common/InseePerimDataset.js';

export class InseePerim2021 extends InseePerimDataset {
  static producer = 'insee';
  static dataset = 'perim';
  static year = 2021;
  static table = 'insee_perim_2021';
  static url = 'https://www.insee.fr/fr/statistiques/fichier/2510634/Intercommunalite_Metropole_au_01-01-2021.zip';

  fileType: FileTypeEnum = FileTypeEnum.Xls;
  sheetOptions = {
    name: 'Composition_communale',
    startRow: 5,
  };

  readonly importSql = `
    UPDATE ${this.targetTableWithSchema} SET
      l_arr = t.libgeo,
      com = t.codgeo,
      l_com = t.libgeo,
      epci = t.epci,
      l_epci = t.libepci,
      dep = t.dep,
      reg = t.reg
    FROM ${this.tableWithSchema} t
    WHERE year = 2021 AND arr = t.codgeo;
  `;

  readonly extraImportSql = `
    UPDATE ${this.targetTableWithSchema} SET
      l_com = t.libgeo,
      epci = t.epci,
      l_epci = t.libepci,
      dep = t.dep,
      reg = t.reg
    FROM ${this.tableWithSchema} t
    WHERE year = 2021 AND l_com IS NULL AND com = t.codgeo;
  `;
}
