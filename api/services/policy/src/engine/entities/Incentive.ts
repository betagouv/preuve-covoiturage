import {
  IncentiveStateEnum,
  IncentiveStatusEnum,
  MetadataRegistryInterface,
  SerializedIncentiveInterface,
  StatefulIncentiveInterface,
  StatelessIncentiveInterface,
} from '../../interfaces';
import { MetadataRegistry } from './MetadataRegistry';

export class Incentive implements StatelessIncentiveInterface, StatefulIncentiveInterface {
  constructor(
    public readonly _id: number | undefined,
    public readonly policy_id: number,
    public readonly carpool_id: number,
    public readonly datetime: Date,
    public statelessAmount: number,
    public statefulAmount: number,
    public status: IncentiveStatusEnum,
    public state: IncentiveStateEnum,
    public meta: MetadataRegistryInterface,
  ) {}

  static create(policy_id: number, carpool_id: number, datetime: Date, meta?: MetadataRegistryInterface): Incentive {
    return new Incentive(
      undefined,
      policy_id,
      carpool_id,
      datetime,
      0,
      0,
      IncentiveStatusEnum.Draft,
      IncentiveStateEnum.Regular,
      meta || MetadataRegistry.create(policy_id, datetime),
    );
  }

  static import(data: SerializedIncentiveInterface): Incentive {
    return new Incentive(
      data._id,
      data.policy_id,
      data.carpool_id,
      data.datetime,
      data.statelessAmount,
      data.statefulAmount,
      data.status,
      data.state,
      MetadataRegistry.import(data.policy_id, data.datetime, data.meta),
    );
  }

  export(): SerializedIncentiveInterface {
    return {
      _id: this._id,
      policy_id: this.policy_id,
      carpool_id: this.carpool_id,
      datetime: this.datetime,
      statelessAmount: this.statelessAmount,
      statefulAmount: this.statefulAmount,
      status: this.status,
      state: this.state,
      meta: this.meta.export(),
    };
  }

  get(): number {
    return this._id ? this.statefulAmount : this.statelessAmount;
  }

  set(amount: number): void {
    if (this._id) {
      this.statefulAmount = amount;
    } else {
      this.statelessAmount = amount;
      this.statefulAmount = amount;
    }
  }

  getMeta(): MetadataRegistryInterface {
    return this.meta;
  }

  setMeta(registry: MetadataRegistryInterface): void {
    this.meta = registry;
  }
}
