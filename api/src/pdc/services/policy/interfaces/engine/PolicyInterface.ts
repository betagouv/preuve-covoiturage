import { Timezone } from '@pdc/providers/validator';
import { PolicyStatusEnum } from '@shared/policy/common/interfaces/PolicyInterface';
import { LogFn } from 'ava';
import {
  BoundedSlices,
  CarpoolInterface,
  MetadataAccessorInterface,
  MetadataRegistryInterface,
  MetadataStoreInterface,
  OperatorsEnum,
  SerializedIncentiveInterface,
  SliceInterface,
  StatefulIncentiveInterface,
  StatelessIncentiveInterface,
  TerritorySelectorsInterface,
  UnboundedSlices,
} from '.';

export interface PolicyInterface {
  _id: number;
  territory_id: number;
  territory_selector: TerritorySelectorsInterface;
  name: string;
  start_date: Date;
  end_date: Date;
  tz: Timezone;
  handler: PolicyHandlerInterface;
  status: PolicyStatusEnum;

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
  tz: Timezone;
  handler: string;
  status: PolicyStatusEnum;
  incentive_sum: number;
  max_amount?: number;
}

export interface PolicyHandlerStaticInterface {
  policy_max_amount?: number;
  readonly id: string;
  readonly tz?: Timezone;
  readonly boosterDates?: string[];
  mode?<T>(date: Date, regular: T, booster: T): T;
  /**
   * Optional max amount to spend for the policy
   */
  new (policy_max_amount?: number): PolicyHandlerInterface;
}

export interface PolicyHandlerParamsInterface {
  tz?: Timezone;
  slices?: RunnableSlices | BoundedSlices;
  operators?: Array<OperatorsEnum>;
  limits?: {
    glob?: number;
  };
  booster_dates?: Array<string>;
}

// Let the policy handler define its own log function
// when test suites have their own logging requirements (e.g. ava)
export type TestingLogFn = LogFn;

export interface PolicyHandlerInterface {
  max_amount?: number;
  load(): Promise<void>;
  processStateless(context: StatelessContextInterface, log?: TestingLogFn): void;
  processStateful(context: StatefulContextInterface, log?: TestingLogFn): void;
  params(): PolicyHandlerParamsInterface;
  describe(): string;
  getOperators?(datetime?: Date): OperatorsEnum[]; // TODO generalise this from GrandPoitiers campaign
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

/**
 * Extend the public bounded and unbounded slices with a runnable function
 * for use in the policy calculations
 */
export type RunnableSlice<TFunction> = SliceInterface & { fn: TFunction };
export type RunnableSlices =
  | BoundedSlices<RunnableSlice<(ctx: StatelessContextInterface) => number>>
  | UnboundedSlices<RunnableSlice<(ctx: StatelessContextInterface) => number>>;
