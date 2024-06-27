import { AbstractDataset } from "../../../../common/AbstractDataset.ts";
import {
  ArchiveFileTypeEnum,
  FileTypeEnum,
} from "../../../../interfaces/index.ts";

export class CeremaAom2023 extends AbstractDataset {
  static producer = "cerema";
  static dataset = "aom";
  static year = 2023;
  static table = "cerema_aom_2023";
  static url =
    "http://www.cerema.fr/system/files/documents/2023/04/base_rt_diffusion.ods";

  readonly fileArchiveType: ArchiveFileTypeEnum = ArchiveFileTypeEnum.None;
  readonly rows: Map<string, [string, string]> = new Map([
    ["id_reseau", ["Id réseau", "integer"]],
    ["nom_reseau", ["Nom du réseau", "varchar"]],
    ["siren_aom", ["N° SIREN AOM", "varchar"]],
    ["nom_aom", ["Nom de l’AOM", "varchar"]],
    ["forme_juridique_aom", ["Forme juridique de l’AOM", "varchar"]],
    ["region", ["Région siège", "varchar"]],
    ["departement", ["Département siège", "varchar"]],
    ["siren_group", ["N° SIREN groupement", "varchar"]],
    ["lien_banatic", ["Lien Banatic", "varchar"]],
    ["nom_group", ["Nom du groupement", "varchar"]],
    ["forme_juridique_group", ["Nature juridique du groupement", "varchar"]],
    ["nb_membres", ["Nombre de membres", "varchar"]],
    ["pop_aom_2019", ["Population  totale 2019", "varchar"]],
    ["nom_membre", ["Nom membre", "varchar"]],
    ["pop_banatic_2019", ["Population  totale 2019 (Banatic)", "varchar"]],
    ["siren_membre", ["Siren membre", "varchar"]],
    ["com", ["N° INSEE", "varchar"]],
    ["wikipedia", ["Lien Page wikipedia", "varchar"]],
  ]);

  fileType: FileTypeEnum = FileTypeEnum.Xls;
  sheetOptions = {
    name: "RT_2023 - Composition_Communale",
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
    WHERE a.com = t.com AND year = 2023;
  `;
}
