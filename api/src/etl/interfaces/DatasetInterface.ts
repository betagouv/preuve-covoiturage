import { Pool } from 'pg';
import { FileManagerInterface, StateManagerInterface } from './index.js';

export interface StaticMigrable {
  readonly uuid: string;
  readonly table: string;
  readonly year: number;
  readonly skipStatePersistence?: boolean;
  new (connection: Pool, file: FileManagerInterface, targetSchema: string): DatasetInterface;
}

export interface StaticAbstractDataset extends StaticMigrable {
  readonly url: string;
  readonly producer: string;
  readonly dataset: string;
}

export interface DatasetInterface {
  validate(state: StateManagerInterface): Promise<void>;
  before(): Promise<void>;
  download(): Promise<void>;
  transform(): Promise<void>;
  load(): Promise<void>;
  import(): Promise<void>;
  after(): Promise<void>;
}
