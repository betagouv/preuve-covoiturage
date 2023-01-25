import { PoolClient } from '@ilos/connection-postgres';
import { FraudCheckEntry, FraudCheckStatusEnum } from './FraudCheck';

export type FraudCheckRepositoryUpdateCallback = (data?: FraudCheckEntry) => Promise<void>;

export interface SearchInterface {
  from?: Date;
  to?: Date;
  limit: number;
  status?: FraudCheckStatusEnum;
}

export abstract class FraudCheckRepositoryProviderInterfaceResolver {
  abstract populate(hours: number): Promise<void>;
  abstract createOrUpdate(data: FraudCheckEntry, pool?: PoolClient): Promise<void>;
  abstract findThenUpdate(
    search: SearchInterface,
    timeout: number,
  ): Promise<[Array<number>, FraudCheckRepositoryUpdateCallback]>;
}
