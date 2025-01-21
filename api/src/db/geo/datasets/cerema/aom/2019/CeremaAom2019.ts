import { AbstractDataset } from "../../../../common/AbstractDataset.ts";
import { ArchiveFileTypeEnum, FileTypeEnum } from "../../../../interfaces/index.ts";

export class CeremaAom2019 extends AbstractDataset {
  static producer = "cerema";
  static dataset = "aom";
  static year = 2019;
  static table = "cerema_aom_2019";
  static url = "https://www.data.gouv.fr/fr/datasets/r/f2bc5340-2ea5-47e9-b8e9-227c4b17302e";
  static sha256 = "5a50552fb8cbd6617cb75f5d65982551dd9e77522e3f1a34b037f926e1af5c51";
  static filename = "base-rt-2019-v1-3-version-diffusable.ods";

  readonly fileArchiveType: ArchiveFileTypeEnum = ArchiveFileTypeEnum.None;
  readonly rows: Map<string, [string, string]> = new Map([
    ["id_reseau", ["Id réseau", "varchar"]],
    ["region", ["Région siège", "varchar"]],
    ["departement", ["Département siège", "varchar"]],
    ["nom_reseau", ["Nom du réseau", "varchar"]],
    ["nom_aom", ["Nom de l’AOM", "varchar"]],
    ["forme_juridique_aom", ["Forme juridique de l’AOM", "varchar"]],
    ["siren_aom", ["N° SIREN de l’AOM", "varchar"]],
    ["siren_group", ["N° SIREN de l’EPCI", "varchar"]],
    ["nom_group", ["Nom de l’EPCI", "varchar"]],
    ["forme_juridique_group", ["Nature juridique de l’EPCI", "varchar"]],
    ["nb_membres", ["Nombre de membres", "integer"]],
    ["pop_aom", ["Population", "integer"]],
    ["siren_membre", ["Siren membre", "varchar"]],
    ["com", ["Code INSEE", "varchar"]],
    ["nom_membre", ["Nom membre", "varchar"]],
    ["pop_com", ["Population municipale", "varchar"]],
  ]);

  fileType: FileTypeEnum = FileTypeEnum.Ods;
  override sheetOptions = {
    name: "RT 2019- Composition communale",
    startRow: 0,
  };

  override readonly tableIndex = "com";
  override readonly importSql = `
    UPDATE ${this.targetTableWithSchema} AS a SET
      aom = t.siren_aom,
      l_aom = t.nom_aom,
      reseau = (CASE WHEN t.id_reseau = '/' THEN NULL ELSE t.id_reseau::integer END),
      l_reseau = t.nom_reseau
    FROM ${this.tableWithSchema} t
    WHERE a.com = t.com AND year = 2019;
  `;
}
