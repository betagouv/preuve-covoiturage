import { FileTypeEnum } from "../../../../interfaces/index.ts";
import { InseePerimDataset } from "../common/InseePerimDataset.ts";

export class InseePerim2019 extends InseePerimDataset {
  static producer = "insee";
  static dataset = "perim";
  static year = 2019;
  static table = "insee_perim_2019";
  static url = "https://www.insee.fr/fr/statistiques/fichier/2510634/Intercommunalite_Metropole_au_01-01-2019.zip";
  static sha256 = "1612d00c3336133b969ca35fcc2c1ab251823240c570e032799820f5ccb62174";

  fileType: FileTypeEnum = FileTypeEnum.Xls;
  override sheetOptions = {
    name: "Composition_communale",
    startRow: 5,
  };

  override readonly importSql = `
    UPDATE ${this.targetTableWithSchema} SET
      l_arr = t.libgeo,
      com = t.codgeo,
      l_com = t.libgeo,
      epci = t.epci,
      l_epci = t.libepci,
      dep = t.dep,
      reg = t.reg
    FROM ${this.tableWithSchema} t
    WHERE year = 2019 AND arr = t.codgeo;
  `;

  override readonly extraImportSql = `
    UPDATE ${this.targetTableWithSchema} SET
      l_com = t.libgeo,
      epci = t.epci,
      l_epci = t.libepci,
      dep = t.dep,
      reg = t.reg
    FROM ${this.tableWithSchema} t
    WHERE year = 2019 AND l_com IS NULL AND com = t.codgeo;
  `;
}
