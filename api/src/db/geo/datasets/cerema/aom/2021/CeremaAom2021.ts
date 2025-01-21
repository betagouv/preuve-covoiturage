import { AbstractDataset } from "../../../../common/AbstractDataset.ts";
import { ArchiveFileTypeEnum, FileTypeEnum } from "../../../../interfaces/index.ts";

export class CeremaAom2021 extends AbstractDataset {
  static producer = "cerema";
  static dataset = "aom";
  static year = 2021;
  static table = "cerema_aom_2021";
  static url = "https://www.data.gouv.fr/fr/datasets/r/4d5c743e-8846-4bdf-bf2e-01af6e7a75af";
  static sha256 = "5e0aa65dac5804efdfc5033700c6533a478dad3f2ca85ed628e6bb6c92a452dd";
  static filename = "base-rt-2021-v4-diffusion.xlsx";

  readonly fileArchiveType: ArchiveFileTypeEnum = ArchiveFileTypeEnum.None;
  readonly rows: Map<string, [string, string]> = new Map([
    ["id_reseau", ["Id réseau", "integer"]],
    ["nom_reseau", ["Nom du réseau", "varchar"]],
    ["siren_aom", ["N° SIREN AOM", "integer"]],
    ["nom_aom", ["Nom de l’AOM", "varchar"]],
    ["forme_juridique_aom", ["Forme juridique de l’AOM", "varchar"]],
    ["region", ["Région siège", "varchar"]],
    ["departement", ["Département siège", "varchar"]],
    ["siren_group", ["N° SIREN groupement", "varchar"]],
    ["lien_banatic", ["Lien Banatic", "varchar"]],
    ["nom_group", ["Nom du groupement", "varchar"]],
    ["forme_juridique_group", ["Nature juridique du groupement", "varchar"]],
    ["nb_membres", ["Nombre de membres", "varchar"]],
    ["pop_aom_2018", ["Population  totale 2018", "integer"]],
    ["siren_membre", ["Siren membre", "integer"]],
    ["com", ["N° INSEE", "varchar"]],
    ["nom_membre", ["Nom membre", "varchar"]],
    ["pop_com_2018", ["Population  municipale 2018", "varchar"]],
    ["pop_banatic_2018", ["Population  totale 2018 (Banatic)", "integer"]],
    ["surface", ["Surface (km²)", "float"]],
    ["nom_com", ["Intitulé commune wikipédia", "varchar"]],
    ["wikipedia", ["Lien Page wikipedia", "varchar"]],
  ]);

  fileType: FileTypeEnum = FileTypeEnum.Xls;
  override sheetOptions = {
    name: "RT_2021_-_Composition_communale",
    startRow: 0,
  };

  override readonly tableIndex = "com";
  override readonly importSql = `
    UPDATE ${this.targetTableWithSchema} AS a SET
      aom = t.siren_aom,
      l_aom = t.nom_aom,
      reseau = t.id_reseau::integer,
      l_reseau = t.nom_reseau
    FROM ${this.tableWithSchema} t
    WHERE a.com = t.com AND year = 2021;
  `;
}
