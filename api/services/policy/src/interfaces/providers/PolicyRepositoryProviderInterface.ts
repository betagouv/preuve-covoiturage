import { SerializedPolicyInterface } from '..';

export abstract class PolicyRepositoryProviderInterfaceResolver {
  abstract find(id: number, territoryId?: number): Promise<SerializedPolicyInterface>;
  abstract create(data: SerializedPolicyInterface): Promise<SerializedPolicyInterface>;
  abstract patch(data: SerializedPolicyInterface): Promise<SerializedPolicyInterface>;
  abstract delete(id: number): Promise<void>;
  abstract findWhere(search: {
    _id?: number;
    territory_id?: number | null | number[];
    status?: string;
    datetime?: Date;
    ends_in_the_future?: boolean;
  }): Promise<SerializedPolicyInterface[]>;
}
