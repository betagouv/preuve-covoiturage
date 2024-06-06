import { loadFileAsString, streamData, getDatasetUuid } from '../helpers/index.ts';
import {
  ArchiveFileTypeEnum,
  DatasetInterface,
  FileTypeEnum,
  StaticAbstractDataset,
  StaticMigrable,
  FileManagerInterface,
} from '../interfaces/index.ts';
import { Pool } from '@/deps.ts';
import { StreamDataOptions, StateManagerInterface, State } from '../interfaces/index.ts';
import { DownloadError, SqlError, ValidationError } from '../errors/index.ts';

export abstract class AbstractDataset implements DatasetInterface {
  static get uuid(): string {
    const self = this as unknown as StaticAbstractDataset;
    return getDatasetUuid(self.producer, self.dataset, self.year);
  }
  abstract readonly fileArchiveType: ArchiveFileTypeEnum;
  abstract readonly fileType: FileTypeEnum;
  abstract readonly rows: Map<string, [string, string]>;

  readonly tableIndex: string | undefined;
  readonly beforeSql: string | undefined;
  readonly beforeSqlPath: string | undefined;
  readonly extraBeforeSql: string | undefined;
  readonly afterSql: string | undefined;
  readonly afterSqlPath: string | undefined;
  readonly importSql: string = '';
  readonly targetTable: string = 'perimeters';

  required: Set<StaticMigrable> = new Set();
  sheetOptions: StreamDataOptions;
  filepaths: string[] = [];

  get url(): string {
    return (this.constructor as StaticAbstractDataset).url;
  }

  get table(): string {
    return (this.constructor as StaticAbstractDataset).table;
  }

  get targetTableWithSchema(): string {
    return `${this.targetSchema}.${this.targetTable}`;
  }

  get tableWithSchema(): string {
    return `${this.targetSchema}.${this.table}`;
  }

  constructor(
    protected connection: Pool,
    protected file: FileManagerInterface,
    protected targetSchema: string = 'public',
  ) {}

  async validate(state: StateManagerInterface): Promise<void> {
    const done = state.get(State.Done);
    const difference = new Set([...this.required].filter((x) => !done.has(x)));
    if (difference.size > 0) {
      throw new ValidationError(
        this,
        `Cant apply this dataset, element is missing (${[...difference].map((d) => d.uuid).join(', ')})`,
      );
    }
  }

  async before(): Promise<void> {
    try {
      const generatedSql = `
        CREATE TABLE IF NOT EXISTS ${this.tableWithSchema} (
          id SERIAL PRIMARY KEY,
          ${[...this.rows].map(([k, v]) => `${k} ${v[1]}`).join(',\n')}
        );
        ${
          this.tableIndex
            ? `
          CREATE INDEX IF NOT EXISTS ${this.tableWithSchema.replace('.', '_')}
            ON ${this.tableWithSchema} USING btree(${this.tableIndex});`
            : ''
        }
        ${this.extraBeforeSql || ''}
      `;
      const sql = this.beforeSql
        ? this.beforeSql
        : this.beforeSqlPath
        ? await loadFileAsString(this.beforeSqlPath)
        : generatedSql;
      await this.connection.query(sql);
    } catch (e) {
      throw new SqlError(this, (e as Error).message);
    }
  }

  async download(): Promise<void> {
    try {
      const filepaths: string[] = [];
      const filepath = await this.file.download(this.url);
      if (this.fileArchiveType !== ArchiveFileTypeEnum.None) {
        filepaths.push(...(await this.file.decompress(filepath, this.fileArchiveType, this.fileType)));
      } else {
        filepaths.push(filepath);
      }
      this.filepaths = filepaths;
    } catch (e) {
      throw new DownloadError(this, (e as Error).message);
    }
  }

  async transform(): Promise<void> {}

  async load(): Promise<void> {
    const connection = await this.connection.connect();
    await connection.query('BEGIN TRANSACTION');
    let i = 1;
    try {
      for (const filepath of this.filepaths) {
        const cursor = streamData(filepath, this.fileType, this.sheetOptions);
        let done = false;
        do {
          const results = await cursor.next();
          done = !!results.done;
          if (results.value) {
            console.debug(`Batch ${i}`);
            const query = {
              text: `
                        INSERT INTO ${this.tableWithSchema} (
                            ${[...this.rows.keys()].join(', \n')}
                        )
                        SELECT *
                        FROM json_to_recordset ($1)
                          AS tmp (
                          ${[...this.rows.values()].map((r) => `"${r[0]}" ${r[1]}`).join(', \n')}
                          )
                        ON CONFLICT DO NOTHING
                      `,
              values: [JSON.stringify(results.value)],
            };
            await connection.query(query);
          }
          i += 1;
        } while (!done);
      }
      await connection.query('COMMIT');
      connection.release();
    } catch (e) {
      await connection.query('ROLLBACK');
      connection.release();
      throw new SqlError(this, (e as Error).message);
    }
  }

  async import(): Promise<void> {
    try {
      await this.connection.query(this.importSql);
    } catch (e) {
      throw new SqlError(this, (e as Error).message);
    }
  }

  async after(): Promise<void> {
    try {
      const generatedSql = `DROP TABLE IF EXISTS ${this.tableWithSchema}`;
      const sql = this.afterSql
        ? this.afterSql
        : this.afterSqlPath
        ? await loadFileAsString(this.afterSqlPath)
        : generatedSql;
      await this.connection.query(sql);
    } catch (e) {
      throw new SqlError(this, (e as Error).message);
    }
  }
}
