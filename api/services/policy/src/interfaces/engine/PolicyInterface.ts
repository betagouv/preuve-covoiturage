import {
  CarpoolInterface,
  MetadataAccessorInterface,
  MetadataRegistryInterface,
  MetadataStoreInterface,
  SerializedIncentiveInterface,
  StatefulIncentiveInterface,
  StatelessIncentiveInterface,
  TerritorySelectorsInterface,
} from '.';

export interface PolicyInterface {
  _id: number;
  territory_id: number;
  territory_selector: TerritorySelectorsInterface;
  name: string;
  start_date: Date;
  end_date: Date;
  handler: PolicyHandlerInterface;
  status: string;

  export(): SerializedPolicyInterface;
  processStateless(carpool: CarpoolInterface): Promise<StatelessIncentiveInterface>;
  processStateful(
    store: MetadataStoreInterface,
    incentive: SerializedIncentiveInterface,
  ): Promise<StatefulIncentiveInterface>;
  describe(): Array<StepInterface>;
  describeForHuman(): string;
}

export interface SerializedPolicyInterface {
  _id: number;
  territory_id: number;
  territory_selector: TerritorySelectorsInterface;
  name: string;
  start_date: Date;
  end_date: Date;
  handler: string;
  status: string;
}

export interface PolicyHandlerStaticInterface {
  new (): PolicyHandlerInterface;
}

export interface StepInterface {
  start: number;
  end: number;
}

export interface PolicyHandlerInterface {
  processStateless(context: StatelessContextInterface): void;
  processStateful(context: StatefulContextInterface): void;
  describe(): Array<StepInterface>;
  describeForHuman(): string;
}

export type StatelessRuleHelper<P> = (ctx: StatelessContextInterface, params: P) => boolean;

export interface StatefulContextInterface {
  incentive: StatefulIncentiveInterface;
  meta: MetadataAccessorInterface;
}

export interface StatelessContextInterface {
  incentive: StatelessIncentiveInterface;
  meta: MetadataRegistryInterface;
  carpool: CarpoolInterface;
}
