import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { Config as ExportParamsConfig } from '../models/ExportParams';

export type Export = {
  _id: number;
  uuid: string;
  type: ExportType;
  status: ExportStatus;
  progress: number;
  created_by: number;
  download_url_expire_at: Date;
  download_url: string;
  params: ExportParamsConfig;
  error: any; // TODO
  stats: any; // TODO
};
export enum ExportStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILURE = 'failure',
}
export enum ExportType {
  OPENDATA = 'opendata',
  OPERATOR = 'operator',
  TERRITORY = 'territory',
  REGISTRY = 'registry',
}
export type ExportCreateData = Pick<Export, 'created_by' | 'type' | 'params'>;
export type ExportUpdateData = Partial<Pick<Export, 'status' | 'progress' | 'download_url' | 'error' | 'stats'>>;
export type ExportProgress = (progress: number) => Promise<void>;

export interface ExportRepositoryInterface {
  create(data: ExportCreateData): Promise<number>;
  get(id: number): Promise<Export>;
  update(id: number, data: ExportUpdateData): Promise<void>;
  delete(id: number): Promise<void>;
  list(): Promise<Export[]>;
  progress(id: number): Promise<ExportProgress>;
}

export abstract class ExportRepositoryInterfaceResolver implements ExportRepositoryInterface {
  public async create(data: ExportCreateData): Promise<number> {
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
  public async progress(id: number): Promise<ExportProgress> {
    throw new Error('Not implemented');
  }
}

@provider({
  identifier: ExportRepositoryInterfaceResolver,
})
export class ExportRepository implements ExportRepositoryInterface {
  protected readonly table = 'export.exports';

  constructor(protected connection: PostgresConnection) {}

  public async create(data: ExportCreateData): Promise<number> {
    const { rows } = await this.connection.getClient().query({
      text: `INSERT INTO ${this.table} (created_by, type, params) VALUES ($1, $2, $3) RETURNING _id`,
      values: [data.created_by, data.type, data.params],
    });
    return rows[0]._id;
  }

  public async get(id: number): Promise<Export> {
    const { rows } = await this.connection.getClient().query({
      text: `SELECT * FROM ${this.table} WHERE _id = $1`,
      values: [id],
    });
    return rows[0];
  }

  public async update(id: number, data: ExportUpdateData): Promise<void> {
    await this.connection.getClient().query({
      text: `UPDATE ${this.table} SET ${Object.keys(data)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ')} WHERE _id = $1`,
      values: [id, ...Object.values(data)],
    });
  }

  public async delete(id: number): Promise<void> {
    await this.connection.getClient().query({
      text: `DELETE FROM ${this.table} WHERE _id = $1`,
      values: [id],
    });
  }

  public async list(): Promise<Export[]> {
    const { rows } = await this.connection.getClient().query({
      text: `SELECT * FROM ${this.table}`,
    });
    return rows;
  }

  // progress callback to be injected in the carpool repository
  // to be able to update the `progress` field of the export as the export is running
  public async progress(id: number): Promise<ExportProgress> {
    return async (progress: number) => {
      await this.connection.getClient().query({
        text: `UPDATE ${this.table} SET progress = $1::int WHERE _id = $2`,
        values: [progress, id],
      });
    };
  }
}
