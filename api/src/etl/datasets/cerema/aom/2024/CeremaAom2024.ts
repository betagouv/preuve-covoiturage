import { AbstractDataset } from "../../../../common/AbstractDataset.ts";
import {
  ArchiveFileTypeEnum,
  FileTypeEnum,
} from "../../../../interfaces/index.ts";

export class CeremaAom2024 extends AbstractDataset {
  static producer = "cerema";
  static dataset = "aom";
  static year = 2024;
  static table = "cerema_aom_2024";
  static url =
    "https://www.data.gouv.fr/fr/datasets/r/a2350747-651e-42e2-9888-26b2604474f7";

  readonly fileArchiveType: ArchiveFileTypeEnum = ArchiveFileTypeEnum.None;
  readonly rows: Map<string, [string, string]> = new Map([
    ["id_reseau", ["id réseau", "integer"]],
    ["siren_aom", ["N° SIREN AOM", "varchar"]],
    ["nom_aom", ["Nom de l’AOM", "varchar"]],
    ["forme_juridique_aom", ["Forme juridique De l’AOM", "varchar"]],
    ["region", ["Région siège", "varchar"]],
    ["departement", ["Département siège", "varchar"]],
    ["siren_group", ["N° SIREN Groupement", "varchar"]],
    ["lien_banatic", ["Lien Banatic", "varchar"]],
    ["nom_group", ["Nom du groupement", "varchar"]],
    ["forme_juridique_group", ["Nature juridique Du groupement", "varchar"]],
    ["nb_membres", ["Nombre De membres", "varchar"]],
    ["pop_aom_2021", ["Population totale 2021(INSEE)", "varchar"]],
    ["nom_membre", ["Nom membre", "varchar"]],
    ["pop_banatic_2019", ["Population totale 2019 (Banatic)", "varchar"]],
    ["siren_membre", ["Siren membre", "varchar"]],
    ["com", ["N° INSEE", "varchar"]],
    ["wikipedia", ["Lien Page Wikipedia", "varchar"]],
  ]);

  fileType: FileTypeEnum = FileTypeEnum.Xls;
  sheetOptions = {
    name: "RT_2024_composition_communale",
    startRow: 0,
  };

  readonly tableIndex = "com";
  readonly importSql = `
    UPDATE ${this.targetTableWithSchema} AS a SET
      aom = CASE WHEN t.siren_aom ~ '^[0-9]*$' THEN t.siren_aom::integer ELSE NULL END,
      l_aom = t.nom_aom,
      reseau = t.id_reseau::integer,
      l_reseau = t.nom_reseau
    FROM ${this.tableWithSchema} t
    WHERE a.com = t.com AND year = 2024;
  `;
}
