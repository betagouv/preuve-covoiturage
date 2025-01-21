import { AbstractDataset } from "../../../../common/AbstractDataset.ts";
import { ArchiveFileTypeEnum, FileTypeEnum } from "../../../../interfaces/FileInterface.ts";

export class CeremaAom2024 extends AbstractDataset {
  static producer = "cerema";
  static dataset = "aom";
  static year = 2024;
  static table = "cerema_aom_2024";
  static url = "https://geo-datasets-archives.s3.fr-par.scw.cloud/cerema_aom_2024.csv";
  static sha256 = "4c7c5128d5351e458bfd6a2b5aaa85595ca88cc4d590f448626fa4035c37d5dc";

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
    WHERE target.com = t.com AND target.year = 2024
  `;
}
