import type pg from "dep:pg";
import { SqlError, ValidationError } from "../errors/index.ts";
import {
  DatasetInterface,
  FileManagerInterface,
  State,
  StateManagerInterface,
  StaticAbstractDataset,
  StaticMigrable,
} from "../interfaces/index.ts";

export abstract class AbstractDatafunction implements DatasetInterface {
  static skipStatePersistence = true;
  abstract readonly sql: string;
  readonly targetTable: string = "perimeters";

  get table(): string {
    return (this.constructor as StaticAbstractDataset).table;
  }

  get targetTableWithSchema(): string {
    return `${this.targetSchema}.${this.targetTable}`;
  }

  get functionWithSchema(): string {
    return `${this.targetSchema}.${this.table}`;
  }

  required: Set<StaticMigrable> = new Set();

  constructor(
    protected connection: pg.Pool,
    protected file: FileManagerInterface,
    protected targetSchema: string = "public",
  ) {}

  async validate(state: StateManagerInterface): Promise<void> {
    const done = state.get(State.Done);
    const difference = new Set([...this.required].filter((x) => !done.has(x)));
    if (difference.size > 0) {
      throw new ValidationError(
        this,
        `Cant apply this function, element is missing (${[...difference].map((d) => d.uuid).join(", ")})`,
      );
    }
  }

  async before(): Promise<void> {}

  async download(): Promise<void> {}

  async transform(): Promise<void> {}

  async load(): Promise<void> {
    try {
      await this.connection.query(this.sql);
    } catch (e) {
      throw new SqlError(this, (e as Error).message);
    }
  }

  async import(): Promise<void> {}

  async after(): Promise<void> {}
}
