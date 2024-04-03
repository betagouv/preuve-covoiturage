import { PolicyStatusEnum } from '@shared/policy/common/interfaces/PolicyInterface';
import { SerializedPolicyInterface } from '..';

export interface LockInformationInterface {
  from_date: Date;
  to_date: Date;
  error?: Error;
}

export abstract class PolicyRepositoryProviderInterfaceResolver {
  abstract getLock(): Promise<{ _id: number; started_at: Date } | null>;
  abstract releaseLock(lockInformation: LockInformationInterface): Promise<void>;
  abstract clearDeadLocks(): Promise<void>;
  abstract find(id: number, territoryId?: number): Promise<SerializedPolicyInterface | undefined>;
  abstract create(data: Omit<SerializedPolicyInterface, '_id'>): Promise<SerializedPolicyInterface>;
  abstract patch(data: SerializedPolicyInterface): Promise<SerializedPolicyInterface>;
  abstract delete(id: number): Promise<void>;
  abstract findWhere(search: {
    _id?: number;
    territory_id?: number | null | number[];
    status?: PolicyStatusEnum;
    datetime?: Date;
    ends_in_the_future?: boolean;
  }): Promise<SerializedPolicyInterface[]>;
  abstract listApplicablePoliciesId(): Promise<number[]>;
  abstract activeOperators(policy_id: number): Promise<number[]>;
  abstract syncIncentiveSum(campaign_id: number): Promise<void>;
  abstract updateAllCampaignStatuses(): Promise<void>;
}
