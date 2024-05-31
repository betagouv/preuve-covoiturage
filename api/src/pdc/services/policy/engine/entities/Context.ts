import {
  CarpoolInterface,
  MetadataAccessorInterface,
  MetadataRegistryInterface,
  MetadataStoreInterface,
  SerializedIncentiveInterface,
  StatefulContextInterface,
  StatefulIncentiveInterface,
  StatelessContextInterface,
  StatelessIncentiveInterface,
} from '../../interfaces/index.ts';
import { Incentive } from './Incentive.ts';
import { MetadataRegistry } from './MetadataRegistry.ts';

export class StatelessContext implements StatelessContextInterface {
  constructor(
    public incentive: StatelessIncentiveInterface,
    public meta: MetadataRegistryInterface,
    public carpool: CarpoolInterface,
  ) {}

  static fromCarpool(policy_id: number, carpool: CarpoolInterface): StatelessContext {
    const registry = MetadataRegistry.create(policy_id, carpool.datetime);
    return new StatelessContext(
      Incentive.create(policy_id, carpool.operator_id, carpool.operator_journey_id, carpool.datetime, registry),
      registry,
      carpool,
    );
  }
}

export class StatefulContext implements StatefulContextInterface {
  constructor(
    public incentive: StatefulIncentiveInterface,
    public meta: MetadataAccessorInterface,
  ) {}

  static async fromIncentive(
    store: MetadataStoreInterface,
    incentiveData: SerializedIncentiveInterface,
  ): Promise<StatefulContext> {
    const incentive = Incentive.import(incentiveData);
    return new StatefulContext(incentive, await store.load(incentive.getMeta()));
  }
}
