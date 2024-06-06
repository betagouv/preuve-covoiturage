import {
  FileManagerInterface,
  DatasetInterface,
  StaticMigrable,
  StaticAbstractDataset,
  StateManagerInterface,
  State,
} from '../interfaces/index.ts';
import { Pool } from '@/deps.ts';
import { SqlError, ValidationError } from '../errors/index.ts';

export abstract class AbstractDatatreatment implements DatasetInterface {
  static skipStatePersistence = true;
  abstract readonly sql: string;
  readonly targetTable: string = 'perimeters';

  get table(): string {
    return (this.constructor as StaticAbstractDataset).table;
  }

  get targetTableWithSchema(): string {
    return `${this.targetSchema}.${this.targetTable}`;
  }

  get tableWithSchema(): string {
    return `${this.targetSchema}.${this.table}`;
  }

  required: Set<StaticMigrable> = new Set();

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
        `Cant apply this function, element is missing (${[...difference].map((d) => d.uuid).join(', ')})`,
      );
    }
  }

  async before(): Promise<void> {}

  async download(): Promise<void> {}

  async transform(): Promise<void> {}

  async load(): Promise<void> {}

  async import(): Promise<void> {}

  async after(): Promise<void> {
    try {
      await this.connection.query(this.sql);
    } catch (e) {
      throw new SqlError(this, (e as Error).message);
    }
  }
}
