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
    "https://www.data.gouv.fr/fr/datasets/r/0f49f5b0-9607-49cf-a018-490f6e1ec69f";

  readonly fileArchiveType: ArchiveFileTypeEnum = ArchiveFileTypeEnum.None;
  readonly rows: Map<string, [string, string]> = new Map([
    ["id_reseau", ["17", "varchar"]],
    ["siren_aom", ["7", "varchar"]],
    ["nom_aom", ["6", "varchar"]],
    ["forme_juridique_aom", ["8", "varchar"]],
    ["region", ["13", "varchar"]],
    ["departement", ["14", "varchar"]],
    ["siren_group", ["16", "varchar"]],
    ["siren_membre", ["1", "varchar"]],
    ["com", ["2", "varchar"]],
  ]);

  fileType: FileTypeEnum = FileTypeEnum.Csv;
  override readonly tableIndex = "com";
  override readonly importSql = `
    UPDATE ${this.targetTableWithSchema} AS a SET
      aom = CASE WHEN t.siren_aom ~ '^[0-9]*$' THEN t.siren_aom ELSE NULL END,
      l_aom = t.nom_aom,
      reseau = null,
      l_reseau = null
    FROM ${this.tableWithSchema} t
    WHERE a.com = t.com AND year = 2024;
  `;
}
