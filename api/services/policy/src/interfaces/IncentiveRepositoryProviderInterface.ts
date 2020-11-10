import { PoolClient } from '@ilos/connection-postgres';

import { IncentiveInterface } from '.';
import { CampaignStateInterface } from './CampaignInterface';

export type IncentiveCreateOptionsType = { connection?: PoolClient | null; release?: boolean };

export interface IncentiveRepositoryProviderInterface {
  updateManyAmount(data: { carpool_id: number; policy_id: number; amount: number }[]): Promise<void>;
  createOrUpdateMany(data: IncentiveInterface[]): Promise<void>;
  disableOnCanceledTrip(): Promise<void>;
  lockAll(before: Date): Promise<void>;
  findDraftIncentive(before: Date, batchSize?: number): AsyncGenerator<IncentiveInterface[], void, void>;
  getCampaignState(policy_id: number): Promise<CampaignStateInterface>;
}

export abstract class IncentiveRepositoryProviderInterfaceResolver implements IncentiveRepositoryProviderInterface {
  abstract async updateManyAmount(data: { carpool_id: number; policy_id: number; amount: number }[]): Promise<void>;
  abstract async createOrUpdateMany(data: IncentiveInterface[]): Promise<void>;
  abstract async disableOnCanceledTrip(): Promise<void>;
  abstract async lockAll(before: Date): Promise<void>;
  abstract findDraftIncentive(before: Date, batchSize?: number): AsyncGenerator<IncentiveInterface[], void, void>;
  abstract async getCampaignState(policy_id: number): Promise<CampaignStateInterface>;
}
