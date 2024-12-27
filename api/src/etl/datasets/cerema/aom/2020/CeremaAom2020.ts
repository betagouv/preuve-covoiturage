import { AbstractDataset } from "../../../../common/AbstractDataset.ts";
import { ArchiveFileTypeEnum, FileTypeEnum } from "../../../../interfaces/index.ts";

export class CeremaAom2020 extends AbstractDataset {
  static producer = "cerema";
  static dataset = "aom";
  static year = 2020;
  static table = "cerema_aom_2020";
  static url = "https://www.data.gouv.fr/fr/datasets/r/695e40e6-77f4-45ef-a29b-afdd417add50";
  static sha256 = "415d5c1f236977ee917a70e70dc17116f83ffb5ab7bcc9a28550c4852a587003";
  static filename = "base-rt-2020-v1-2-avec-communes-aom.ods";

  readonly fileArchiveType: ArchiveFileTypeEnum = ArchiveFileTypeEnum.None;
  readonly rows: Map<string, [string, string]> = new Map([
    ["id_reseau", ["Id réseau", "integer"]],
    ["nom_reseau", ["Nom du réseau", "varchar"]],
    ["siren_aom", ["N° SIREN AOM", "integer"]],
    ["nom_aom", ["Nom de l’AOM", "varchar"]],
    ["forme_juridique_aom", ["Forme juridique de l’AOM", "varchar"]],
    ["region", ["Région siège", "varchar"]],
    ["departement", ["Département siège", "varchar"]],
    ["siren_group", ["N° SIREN groupement", "integer"]],
    ["lien_banatic", ["Lien Banatic", "varchar"]],
    ["nom_group", ["Nom du groupement", "varchar"]],
    ["forme_juridique_group", ["Nature juridique du groupement", "varchar"]],
    ["nb_membres", ["Nombre de membres", "integer"]],
    ["pop_aom_2017", ["Population  totale 2017 (Banatic)", "integer"]],
    ["siren_membre", ["Siren membre", "integer"]],
    ["com", ["N° INSEE", "varchar"]],
    ["nom_membre", ["Nom membre", "varchar"]],
    ["pop_com_2017", ["Population  municipale 2017", "varchar"]],
    ["pop_banatic_2017", ["Population  totale 2017 (Banatic)_1", "integer"]],
    ["surface", ["Surface (km²)", "integer"]],
    ["nom_com", ["intitulé commune wikipédia", "varchar"]],
    ["wikipedia", ["Lien Page wikipedia", "varchar"]],
  ]);

  fileType: FileTypeEnum = FileTypeEnum.Ods;
  override sheetOptions = {
    name: "RT_2020_-_Composition_communale",
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
    WHERE a.com = t.com AND year = 2020;
  `;
}
