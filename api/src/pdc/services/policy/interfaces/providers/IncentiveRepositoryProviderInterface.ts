import { SerializedIncentiveInterface, IncentiveStatusEnum } from '..';

export abstract class IncentiveRepositoryProviderInterfaceResolver {
  abstract updateStatefulAmount(
    data: Array<SerializedIncentiveInterface<number>>,
    status?: IncentiveStatusEnum,
  ): Promise<void>;
  abstract createOrUpdateMany(data: Array<SerializedIncentiveInterface<undefined>>): Promise<void>;
  abstract disableOnCanceledTrip(from: Date, to: Date): Promise<void>;
  abstract setStatus(from: Date, to: Date, hasFailed?: boolean): Promise<void>;
  abstract findDraftIncentive(
    to: Date,
    batchSize?: number,
    from?: Date,
  ): AsyncGenerator<Array<SerializedIncentiveInterface<number>>, void, void>;
  abstract latestDraft(): Promise<Date>;
  abstract updateIncentiveSum(): Promise<void>;
}
