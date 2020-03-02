import { PoolClient } from '@ilos/connection-postgres';

import { IncentiveInterface } from './IncentiveInterface';

export type IncentiveCreateOptionsType = { connection?: PoolClient | null; release?: boolean };

export interface IncentiveRepositoryProviderInterface {
  create(data: IncentiveInterface, options?: IncentiveCreateOptionsType): Promise<void>;
  createMany(data: IncentiveInterface[]): Promise<void>;
}

export abstract class IncentiveRepositoryProviderInterfaceResolver implements IncentiveRepositoryProviderInterface {
  async create(data: IncentiveInterface, options?: IncentiveCreateOptionsType): Promise<void> {
    throw new Error();
  }
  async createMany(data: IncentiveInterface[]): Promise<void> {
    throw new Error();
  }
}
