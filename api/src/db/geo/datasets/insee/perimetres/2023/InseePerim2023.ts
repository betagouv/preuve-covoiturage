import { FileTypeEnum } from "../../../../interfaces/index.ts";
import { InseePerimDataset } from "../common/InseePerimDataset.ts";

export class InseePerim2023 extends InseePerimDataset {
  static producer = "insee";
  static dataset = "perim";
  static year = 2023;
  static table = "insee_perim_2023";
  static url = "https://www.insee.fr/fr/statistiques/fichier/2510634/Intercommunalite_Metropole_au_01-01-2023.zip";
  static sha256 = "65e228464d18b45249f642690848b687a1bbc2b5399e18475b938275b475d868";

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
    WHERE year = 2023 AND arr = t.codgeo;
  `;

  override readonly extraImportSql = `
    UPDATE ${this.targetTableWithSchema} SET
      l_com = t.libgeo,
      epci = t.epci,
      l_epci = t.libepci,
      dep = t.dep,
      reg = t.reg
    FROM ${this.tableWithSchema} t
    WHERE year = 2023 AND l_com IS NULL AND com = t.codgeo;
  `;
}
