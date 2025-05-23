import { provider } from "@/ilos/common/index.ts";
import { LegacyPostgresConnection } from "@/ilos/connection-postgres/index.ts";
import { ExportLog, ExportLogEvent } from "../models/ExportLog.ts";

export abstract class LogRepositoryInterfaceResolver {
  public async add(
    export_id: number,
    type: ExportLogEvent,
    message: string,
  ): Promise<void> {
    throw new Error("Not implemented");
  }
  public async list(export_id: number): Promise<ExportLog[]> {
    throw new Error("Not implemented");
  }
}

@provider({
  identifier: LogRepositoryInterfaceResolver,
})
export class LogRepository {
  protected readonly table = "export.logs";

  constructor(protected connection: LegacyPostgresConnection) {}

  public async add(
    export_id: number,
    type: ExportLogEvent,
    message: string,
  ): Promise<void> {
    await this.connection.getClient().query<any>({
      text: `INSERT INTO ${this.table} (export_id, type, message) VALUES ($1, $2, $3)`,
      values: [export_id, type, message],
    });
  }

  public async list(export_id: number): Promise<ExportLog[]> {
    const { rows } = await this.connection.getClient().query<any>({
      text: `SELECT * FROM ${this.table} WHERE export_id = $1 ORDER BY created_at DESC`,
      values: [export_id],
    });

    return rows.map(ExportLog.fromJSON);
  }
}
