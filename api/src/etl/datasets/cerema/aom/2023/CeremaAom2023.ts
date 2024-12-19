import { AbstractDataset } from "../../../../common/AbstractDataset.ts";
import { ArchiveFileTypeEnum, FileTypeEnum } from "../../../../interfaces/index.ts";

export class CeremaAom2023 extends AbstractDataset {
  static producer = "cerema";
  static dataset = "aom";
  static year = 2023;
  static table = "cerema_aom_2023";
  static url = "https://www.data.gouv.fr/fr/datasets/r/4830ebbb-71db-4eb5-a170-8243caf01d84";
  static sha256 = "b68f505f71cd1d7035caddcce31479ac1b1947c13430df39c5ea71938ed33a85";
  static filename = "base-rt-2023-diffusion-v2.ods";

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
  override sheetOptions = {
    name: "RT_2023 - Composition_Communale",
    startRow: 0,
  };

  override readonly tableIndex = "com";
  override readonly importSql = `
    UPDATE ${this.targetTableWithSchema} AS a SET
      aom = CASE WHEN t.siren_aom ~ '^[0-9]*$' THEN t.siren_aom::integer ELSE NULL END,
      l_aom = t.nom_aom,
      reseau = t.id_reseau::integer,
      l_reseau = t.nom_reseau
    FROM ${this.tableWithSchema} t
    WHERE a.com = t.com AND year = 2023;
  `;
}
