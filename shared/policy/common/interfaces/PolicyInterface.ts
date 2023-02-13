import { TerritorySelectorsInterface } from '../../../territory/common/interfaces/TerritoryCodeInterface';
import { CarpoolInterface } from './CarpoolInterface';
import {
  SerializedIncentiveInterface,
  StatefulIncentiveInterface,
  StatelessIncentiveInterface,
} from './IncentiveInterface';
import { MetadataAccessorInterface, MetadataRegistryInterface, MetadataStoreInterface } from './MetadataInterface';
import { OperatorsEnum } from './OperatorsEnum';
import { BoundedSlices, RunnableSlice, UnboundedSlices } from './SliceInterface';

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

export interface CompiledPolicyInterface {
  _id: number;
  territory_id: number;
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  status: string;
  handler: string;
  incentive_sum: number;
  params: {
    slices?: RunnableSlices | BoundedSlices | UnboundedSlices;
    operators?: Array<string>;
    limits?: {
      glob?: number;
    };
  };
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
  max_amount?: number;
}

export interface PolicyHandlerStaticInterface {
  policy_max_amount?: number;
  readonly id: string;
  /**
   * Optional max amount to spend for the policy
   */
  new (policy_max_amount?: number): PolicyHandlerInterface;
}

export type RunnableSlices =
  | BoundedSlices<RunnableSlice<(ctx: StatelessContextInterface) => number>>
  | UnboundedSlices<RunnableSlice<(ctx: StatelessContextInterface) => number>>;

export interface PolicyHandlerParamsInterface {
  slices?: RunnableSlices | BoundedSlices | UnboundedSlices;
  operators?: Array<OperatorsEnum>;
  limits?: {
    glob?: number;
  };
}

export interface PolicyHandlerInterface {
  max_amount?: number;
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
  policy_max_amount?: number;
}
