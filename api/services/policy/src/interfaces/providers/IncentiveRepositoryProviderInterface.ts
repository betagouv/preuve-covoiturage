import { SerializedIncentiveInterface, IncentiveStatusEnum } from '..';

export interface IncentiveStatsInterface {
  amount: number;
  trip_subsidized: number;
  trip_excluded: number;
}

export abstract class IncentiveRepositoryProviderInterfaceResolver {
  abstract updateStatefulAmount(data: Array<SerializedIncentiveInterface>, status?: IncentiveStatusEnum): Promise<void>;
  abstract createOrUpdateMany(data: Array<SerializedIncentiveInterface>): Promise<void>;
  abstract disableOnCanceledTrip(): Promise<void>;
  abstract lockAll(before: Date): Promise<void>;
  abstract findDraftIncentive(
    to: Date,
    batchSize?: number,
    from?: Date,
  ): AsyncGenerator<Array<SerializedIncentiveInterface>, void, void>;
  abstract getPolicyIncentiveStats(policy_id: number): Promise<IncentiveStatsInterface>;
}
