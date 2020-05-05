import { PoolClient } from '@ilos/connection-postgres';

export abstract class Generator<T> {
  constructor(protected pool: PoolClient, ...args: any[]) {}
  async run(items?: T[]): Promise<void> {
    throw new Error('Not implemented');
  }
  static async all<TT>(): Promise<TT[]> {
    throw new Error('Not implemented');
  }
}
