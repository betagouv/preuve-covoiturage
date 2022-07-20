import { TerritorySelectorsInterface } from '~/shared/territory/common/interfaces/TerritoryCodeInterface';
import { UnknownHandlerException } from '../exceptions/UnknownHandlerException';
import { isSelected } from '../helpers';
import {
  CarpoolInterface,
  MetadataStoreInterface,
  PolicyInterface,
  PolicyHandlerInterface,
  SerializedIncentiveInterface,
  SerializedPolicyInterface,
  StatefulIncentiveInterface,
  StatelessIncentiveInterface,
  StepInterface,
} from '../interfaces';
import { policies } from '../policies';
import { StatefulContext, StatelessContext } from './Context';

export class Policy implements PolicyInterface {
  constructor(
    public _id: number,
    public territory_id: number,
    public territory_selector: TerritorySelectorsInterface,
    public name: string,
    public start_date: Date,
    public end_date: Date,
    public handler: PolicyHandlerInterface,
    public status: string,
  ) {}

  static async import(data: SerializedPolicyInterface): Promise<Policy> {
    const ctor = policies.get(data.handler);
    if (!ctor) {
      throw new UnknownHandlerException();
    }

    return new Policy(
      data._id,
      data.territory_id,
      data.territory_selector,
      data.name,
      data.start_date,
      data.end_date,
      new ctor(),
      data.status,
    );
  }

  export(): SerializedPolicyInterface {
    return {
      _id: this._id,
      territory_id: this.territory_id,
      territory_selector: this.territory_selector,
      name: this.name,
      start_date: this.start_date,
      end_date: this.end_date,
      handler: this.handler.constructor.name,
      status: this.status,
    };
  }

  async processStateless(carpool: CarpoolInterface): Promise<StatelessIncentiveInterface> {
    const context = StatelessContext.fromCarpool(this._id, carpool);
    if (this.guard(carpool)) {
      this.handler.processStateless(context);
    }
    return context.incentive;
  }

  async processStateful(
    store: MetadataStoreInterface,
    incentive: SerializedIncentiveInterface,
  ): Promise<StatefulIncentiveInterface> {
    const context = await StatefulContext.fromIncentive(store, incentive);
    this.handler.processStateful(context);
    await store.save(context.meta);
    return context.incentive;
  }

  protected guard(carpool: CarpoolInterface): boolean {
    if (carpool.datetime < this.start_date) {
      return false;
    }

    if (carpool.datetime > this.end_date) {
      return false;
    }

    if (!this.territory_selector || Object.keys(this.territory_selector).length <= 0) {
      return true;
    }

    if (!isSelected(carpool.start, this.territory_selector)) {
      return false;
    }

    if (!isSelected(carpool.end, this.territory_selector)) {
      return false;
    }

    return true;
  }

  describe(): Array<StepInterface> {
    return this.handler.describe();
  }

  describeForHuman(): string {
    return this.handler.describeForHuman();
  }
}
