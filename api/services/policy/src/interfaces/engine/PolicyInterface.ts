import {
  CarpoolInterface,
  MetadataAccessorInterface,
  MetadataRegistryInterface,
  MetadataStoreInterface,
  OperatorsEnum,
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
  params(): PolicyHandlerParamsInterface;
  describe(): string;
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
  incentive_sum: number;
}

export interface PolicyHandlerStaticInterface {
  readonly id: string;
  new (): PolicyHandlerInterface;
}

export interface SliceInterface {
  start: number;
  end: number;
}

export interface PolicyHandlerParamsInterface {
  slices?: Array<SliceInterface>;
  operators?: Array<OperatorsEnum>;
  limits?: {
    glob?: number;
  };
}

export interface PolicyHandlerInterface {
  processStateless(context: StatelessContextInterface): void;
  processStateful(context: StatefulContextInterface): void;
  params(): PolicyHandlerParamsInterface;
  describe(): string;
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
  policy_territory_selector?: TerritorySelectorsInterface;
}
