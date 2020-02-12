import { IncentiveInterface } from './IncentiveInterface';

export interface IncentiveRepositoryProviderInterface {
  create(data: IncentiveInterface): Promise<void>;
  createMany(data: IncentiveInterface[]): Promise<void>;
}

export abstract class IncentiveRepositoryProviderInterfaceResolver implements IncentiveRepositoryProviderInterface {
  async create(data: IncentiveInterface): Promise<void> {
    throw new Error();
  }
  async createMany(data: IncentiveInterface[]): Promise<void> {
    throw new Error();
  }
}
