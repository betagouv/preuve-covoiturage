import { FileTypeEnum } from "../../../../interfaces/index.ts";
import { InseePerimDataset } from "../common/InseePerimDataset.ts";

export class InseePerim2020 extends InseePerimDataset {
  static producer = "insee";
  static dataset = "perim";
  static year = 2020;
  static table = "insee_perim_2020";
  static url = "https://www.insee.fr/fr/statistiques/fichier/2510634/Intercommunalite_Metropole_au_01-01-2020_v1.zip";
  static sha256 = "496b0b6754193ef1e7eebfdfa3a3822d915abf25c1a0b83246ac70d75b7a18d9";

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
    WHERE year = 2020 AND arr = t.codgeo;
  `;

  override readonly extraImportSql = `
    UPDATE ${this.targetTableWithSchema} SET
      l_com = t.libgeo,
      epci = t.epci,
      l_epci = t.libepci,
      dep = t.dep,
      reg = t.reg
    FROM ${this.tableWithSchema} t
    WHERE year = 2020 AND l_com IS NULL AND com = t.codgeo;
  `;
}
