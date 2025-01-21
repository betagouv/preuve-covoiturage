import { FileTypeEnum } from "../../../../interfaces/index.ts";
import { InseePerimDataset } from "../common/InseePerimDataset.ts";

export class InseePerim2022 extends InseePerimDataset {
  static producer = "insee";
  static dataset = "perim";
  static year = 2022;
  static table = "insee_perim_2022";
  static url = "https://www.insee.fr/fr/statistiques/fichier/2510634/Intercommunalite_Metropole_au_01-01-2022.zip";
  static sha256 = "fa6f83a5f5bf421894b2d5fa836634f3e7b2246aaa5c5ead3113012f2744c692";

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
    WHERE year = 2022 AND arr = t.codgeo;
  `;

  override readonly extraImportSql = `
    UPDATE ${this.targetTableWithSchema} SET
      l_com = t.libgeo,
      epci = t.epci,
      l_epci = t.libepci,
      dep = t.dep,
      reg = t.reg
    FROM ${this.tableWithSchema} t
    WHERE year = 2022 AND l_com IS NULL AND com = t.codgeo;
  `;
}
