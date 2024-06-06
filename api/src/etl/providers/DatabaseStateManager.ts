import { Pool } from '@/deps.ts';
import {
  DatabaseStateManagerInterface,
  StateManagerInterface,
  AppConfigInterface,
  StaticMigrable,
  State,
} from '../interfaces/index.ts';
import { MemoryStateManager } from './MemoryStateManager.ts';

export class DatabaseStateManager implements DatabaseStateManagerInterface {
  readonly table: string = 'dataset_migration';
  readonly migrations: Map<string, StaticMigrable>;
  readonly targetSchema: string;

  constructor(protected connection: Pool, config: AppConfigInterface) {
    this.targetSchema = config.targetSchema;
    this.migrations = new Map([...config.datastructures, ...config.datasets].map((m) => [m.uuid, m]));
  }

  get tableWithSchema(): string {
    return `${this.targetSchema}.${this.table}`;
  }

  async install(): Promise<void> {
    await this.connection.query(`
      CREATE TABLE IF NOT EXISTS ${this.tableWithSchema} (
          key varchar(128) PRIMARY KEY,
          millesime smallint NOT NULL DEFAULT EXTRACT(YEAR FROM NOW())::smallint,
          datetime timestamp NOT NULL DEFAULT NOW()
      )
    `);
  }

  async toMemory(): Promise<StateManagerInterface> {
    const result = await this.connection.query(`
      SELECT key FROM ${this.tableWithSchema} ORDER BY datetime ASC
    `);

    const setResult: Set<StaticMigrable> = new Set();
    for (const { key } of result.rows) {
      const migrable = this.migrations.get(key);
      if (!migrable) {
        console.error(`Migration ${key} is not found`);
      } else {
        setResult.add(migrable);
      }
    }

    return new MemoryStateManager(setResult);
  }

  async fromMemory(state: StateManagerInterface): Promise<void> {
    const data = state.get(State.Done);
    const values = JSON.stringify(
      [...data].map((d) => {
        return { key: d.uuid, millesime: d.year };
      }),
    );
    const query = {
      text: `
        INSERT INTO ${this.tableWithSchema} (key,millesime)
        SELECT * FROM
        json_to_recordset($1)
        as t(key varchar, millesime smallint)
        ON CONFLICT DO NOTHING
      `,
      values: [values],
    };
    await this.connection.query(query);
  }
}
