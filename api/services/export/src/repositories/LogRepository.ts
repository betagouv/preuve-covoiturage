import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

export enum LogStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
}

export interface LogRepositoryInterface {
  add(export_id: number, type: LogStatus, message: string): Promise<void>;
}

export abstract class LogRepositoryInterfaceResolver implements LogRepositoryInterface {
  public async add(export_id: number, type: LogStatus, message: string): Promise<void> {
    throw new Error('Not implemented');
  }
}

@provider({
  identifier: LogRepositoryInterfaceResolver,
})
export class LogRepository implements LogRepositoryInterface {
  protected readonly table = 'export.logs';

  constructor(protected connection: PostgresConnection) {}

  public async add(export_id: number, type: LogStatus, message: string): Promise<void> {
    await this.connection.getClient().query({
      text: `INSERT INTO ${this.table} (export_id, type, message) VALUES ($1, $2, $3)`,
      values: [export_id, type, message],
    });
  }
}
