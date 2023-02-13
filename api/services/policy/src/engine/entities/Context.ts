import { CarpoolInterface } from '../../shared/policy/common/interfaces/CarpoolInterface';
import {
  SerializedIncentiveInterface,
  StatefulIncentiveInterface,
  StatelessIncentiveInterface,
} from '../../shared/policy/common/interfaces/IncentiveInterface';
import {
  MetadataAccessorInterface,
  MetadataRegistryInterface,
  MetadataStoreInterface,
} from '../../shared/policy/common/interfaces/MetadataInterface';
import {
  StatefulContextInterface,
  StatelessContextInterface,
} from '../../shared/policy/common/interfaces/PolicyInterface';
import { Incentive } from './Incentive';
import { MetadataRegistry } from './MetadataRegistry';

export class StatelessContext implements StatelessContextInterface {
  constructor(
    public incentive: StatelessIncentiveInterface,
    public meta: MetadataRegistryInterface,
    public carpool: CarpoolInterface,
  ) {}

  static fromCarpool(policy_id: number, carpool: CarpoolInterface): StatelessContext {
    const registry = MetadataRegistry.create(policy_id, carpool.datetime);
    return new StatelessContext(
      Incentive.create(policy_id, carpool._id, carpool.datetime, registry),
      registry,
      carpool,
    );
  }
}

export class StatefulContext implements StatefulContextInterface {
  constructor(public incentive: StatefulIncentiveInterface, public meta: MetadataAccessorInterface) {}

  static async fromIncentive(
    store: MetadataStoreInterface,
    incentiveData: SerializedIncentiveInterface,
  ): Promise<StatefulContext> {
    const incentive = Incentive.import(incentiveData);
    return new StatefulContext(incentive, await store.load(incentive.getMeta()));
  }
}
