import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { Export, ExportStatus } from '../models/Export';
import { ExportRecipient } from '../models/ExportRecipient';
import { LogServiceInterfaceResolver } from '../services/LogService';

export type ExportCreateData = Pick<Export, 'created_by' | 'target' | 'params'> & { recipients: ExportRecipient[] };
export type ExportUpdateData = Partial<Pick<Export, 'status' | 'progress' | 'download_url' | 'error' | 'stats'>>;
export type ExportProgress = (progress: number) => Promise<void>;

export interface ExportRepositoryInterface {
  create(data: ExportCreateData): Promise<Export>;
  get(id: number): Promise<Export>;
  update(id: number, data: ExportUpdateData): Promise<void>;
  delete(id: number): Promise<void>;
  list(): Promise<Export[]>;
  status(id: number, status: ExportStatus): Promise<void>;
  error(id: number, error: string): Promise<void>;
  progress(id: number): Promise<ExportProgress>;
  pickPending(): Promise<Export | null>;
  addRecipient(export_id: number, recipient: ExportRecipient): Promise<void>;
}

export abstract class ExportRepositoryInterfaceResolver implements ExportRepositoryInterface {
  public async create(data: ExportCreateData): Promise<Export> {
    throw new Error('Not implemented');
  }
  public async get(id: number): Promise<Export> {
    throw new Error('Not implemented');
  }
  public async update(id: number, data: ExportUpdateData): Promise<void> {
    throw new Error('Not implemented');
  }
  public async delete(id: number): Promise<void> {
    throw new Error('Not implemented');
  }
  public async list(): Promise<Export[]> {
    throw new Error('Not implemented');
  }
  public async status(id: number, status: ExportStatus): Promise<void> {
    throw new Error('Not implemented');
  }
  public async error(id: number, error: string): Promise<void> {
    throw new Error('Not implemented');
  }
  public async progress(id: number): Promise<ExportProgress> {
    throw new Error('Not implemented');
  }
  public async pickPending(): Promise<Export | null> {
    throw new Error('Not implemented');
  }
  public async addRecipient(export_id: number, recipient: ExportRecipient): Promise<void> {
    throw new Error('Not implemented');
  }
}

@provider({
  identifier: ExportRepositoryInterfaceResolver,
})
export class ExportRepository implements ExportRepositoryInterface {
  protected readonly exportsTable = 'export.exports';
  protected readonly recipientsTable = 'export.recipients';

  constructor(
    protected connection: PostgresConnection,
    protected logger: LogServiceInterfaceResolver,
  ) {}

  public async create(data: ExportCreateData): Promise<Export> {
    const { created_by, target, params, recipients } = data;

    const { rows } = await this.connection.getClient().query<any>({
      text: `
        INSERT INTO ${this.exportsTable} (created_by, target, params)
        VALUES ($1, $2, $3)
        RETURNING *
      `,
      values: [created_by, target, params.get()],
    });
    const exp = Export.fromJSON(rows[0]);

    // add recipients
    for (const recipient of recipients) {
      await this.addRecipient(exp._id, recipient);
    }

    // log the creation event
    await this.logger.created(exp._id);

    return exp;
  }

  public async get(id: number): Promise<Export> {
    const { rows } = await this.connection.getClient().query<any>({
      text: `SELECT * FROM ${this.exportsTable} WHERE _id = $1`,
      values: [id],
    });
    return Export.fromJSON(rows[0]);
  }

  public async update(id: number, data: ExportUpdateData): Promise<void> {
    await this.connection.getClient().query<any>({
      text: `UPDATE ${this.exportsTable} SET ${Object.keys(data)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ')} WHERE _id = $1`,
      values: [id, ...Object.values(data)],
    });
  }

  public async delete(id: number): Promise<void> {
    await this.connection.getClient().query<any>({
      text: `DELETE FROM ${this.exportsTable} WHERE _id = $1`,
      values: [id],
    });
  }

  public async list(): Promise<Export[]> {
    const { rows } = await this.connection.getClient().query<any>({
      text: `SELECT * FROM ${this.exportsTable}`,
    });
    return rows.map(Export.fromJSON);
  }

  public async status(id: number, status: ExportStatus): Promise<void> {
    // update the export status
    await this.connection.getClient().query<any>({
      text: `UPDATE ${this.exportsTable} SET status = $1::text WHERE _id = $2`,
      values: [status, id],
    });

    // log depending on the status
    switch (status) {
      case ExportStatus.RUNNING:
        await this.logger.running(id);
        break;
      case ExportStatus.SUCCESS:
        await this.logger.success(id);
        break;
      case ExportStatus.FAILURE:
        await this.logger.failure(id);
        break;
    }
  }

  public async error(id: number, error: string): Promise<void> {
    // log error event
    await this.logger.failure(id, error);

    // update the export status
    await this.connection.getClient().query<any>({
      text: `UPDATE ${this.exportsTable} SET status = $1, error = $2::text WHERE _id = $3`,
      values: [ExportStatus.FAILURE, error, id],
    });
  }

  // progress callback to be injected in the carpool repository
  // to be able to update the `progress` field of the export as the export is running
  public async progress(id: number): Promise<ExportProgress> {
    return async (progress: number): Promise<void> => {
      await this.connection.getClient().query<any>({
        text: `UPDATE ${this.exportsTable} SET progress = $1::int WHERE _id = $2`,
        values: [progress, id],
      });
    };
  }

  public async pickPending(): Promise<Export | null> {
    const { rows, rowCount } = await this.connection.getClient().query<any>({
      text: `
        SELECT * FROM ${this.exportsTable}
        WHERE status = 'pending'
        ORDER BY created_at ASC
        LIMIT 1
      `,
    });
    return rowCount ? Export.fromJSON(rows[0]) : null;
  }

  public async addRecipient(export_id: number, recipient: ExportRecipient): Promise<void> {
    if (!export_id) throw new Error('Export _id is required');
    if (!recipient.email) throw new Error('Recipient email is required');

    await this.connection.getClient().query<any>({
      text: `
        INSERT INTO ${this.recipientsTable} (export_id, email, fullname, message)
        VALUES ($1, $2, $3, $4)
      `,
      values: [export_id, recipient.email, recipient.fullname, recipient.message],
    });
  }
}
