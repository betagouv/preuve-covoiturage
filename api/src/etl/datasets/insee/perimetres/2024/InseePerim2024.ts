import { FileTypeEnum } from "../../../../interfaces/index.ts";
import { InseePerimDataset } from "../common/InseePerimDataset.ts";

export class InseePerim2024 extends InseePerimDataset {
  static producer = "insee";
  static dataset = "perim";
  static year = 2024;
  static table = "insee_perim_2024";
  static url = "https://www.insee.fr/fr/statistiques/fichier/2510634/epci_au_01-01-2024.zip";
  static sha256 = "b6c9dee214175983f45dcb89a16d069e5fa7a0fd3897a4a8da56d67aab90dafb";

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
    WHERE year = 2024 AND arr = t.codgeo;
  `;

  override readonly extraImportSql = `
    UPDATE ${this.targetTableWithSchema} SET
      l_com = t.libgeo,
      epci = t.epci,
      l_epci = t.libepci,
      dep = t.dep,
      reg = t.reg
    FROM ${this.tableWithSchema} t
    WHERE year = 2024 AND l_com IS NULL AND com = t.codgeo;
  `;
}
