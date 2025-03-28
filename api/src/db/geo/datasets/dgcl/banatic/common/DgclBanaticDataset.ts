import { AbstractDataset } from "../../../../common/AbstractDataset.ts";
import { SqlError } from "../../../../errors/SqlError.ts";
import { ArchiveFileTypeEnum } from "../../../../interfaces/FileInterface.ts";

export abstract class DgclBanaticDataset extends AbstractDataset {
  readonly fileArchiveType: ArchiveFileTypeEnum = ArchiveFileTypeEnum.None;
  readonly rows: Map<string, [string, string]> = new Map([
    ["siren", ["N° SIREN", "varchar"]],
    ["nom", ["Nom du groupement", "varchar"]],
    ["nature", ["Nature juridique", "varchar"]],
    ["date_creation", ["Date de création", "varchar"]],
    ["date_effet", ["Date d'effet", "varchar"]],
    ["competence", ["C4530", "boolean"]],
  ]);
  readonly extraImportSql: string = "";

  override async import(): Promise<void> {
    try {
      await this.connection.query(this.importSql);
      await this.connection.query(this.extraImportSql);
    } catch (e) {
      throw new SqlError(this, (e as Error).message);
    }
  }
}
