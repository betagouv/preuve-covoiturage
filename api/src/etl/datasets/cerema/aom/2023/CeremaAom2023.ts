import { AbstractDataset } from "@/etl/common/AbstractDataset.ts";
import { ArchiveFileTypeEnum, FileTypeEnum } from "@/etl/interfaces/FileInterface.ts";

export class CeremaAom2023 extends AbstractDataset {
  static producer = "cerema";
  static dataset = "aom";
  static year = 2023;
  static table = "cerema_aom_2023";
  static url = "https://geo-datasets-archives.s3.fr-par.scw.cloud/cerema_aom_2023.csv";
  static sha256 = "b3013e9d3b819be29f4bb65db2d19e4973e929e22b0f694cf14b1b60cb34f94b";

  readonly fileArchiveType: ArchiveFileTypeEnum = ArchiveFileTypeEnum.None;
  readonly fileType: FileTypeEnum = FileTypeEnum.Csv;

  readonly rows: Map<string, [string, string]> = new Map([
    ["id_reseau", ["17", "integer"]],
    ["siren_group", ["16", "varchar"]],
    ["nom_group", ["15", "varchar"]],
    ["siren_aom", ["7", "varchar"]],
    ["nom_aom", ["6", "varchar"]],
    ["com", ["2", "varchar"]],
  ]);

  override readonly tableIndex = "com";
  override readonly importSql = `
    UPDATE ${this.targetTableWithSchema} AS target
    SET
      aom = t.siren_aom,
      l_aom = t.nom_aom,
      reseau = CASE WHEN t.id_reseau::text <> '-' THEN t.id_reseau ELSE NULL END,
      l_reseau = t.nom_group
    FROM ${this.tableWithSchema} t
    WHERE target.com = t.com AND target.year = 2023
  `;
}
