import { TerritoryCodeInterface } from '../../shared/territory/common/interfaces/TerritoryCodeInterface';

export interface CarpoolInterface {
  _id: number;
  trip_id: string;
  identity_uuid: string;
  operator_siret: string;
  operator_class: string;
  is_over_18: boolean | null;
  is_driver: boolean;
  has_travel_pass: boolean;
  datetime: Date;
  seats: number;
  duration: number;
  distance: number;
  cost: number;
  start: TerritoryCodeInterface;
  end: TerritoryCodeInterface;
}

export interface StepRuleInterface {
  start: number;
  end: number;
}

export enum MetadataLifetime {
  Day = 0,
  Month = 1,
  Always = 2,
}

export enum IncentiveStateEnum {
  Regular = 'regular',
  Null = 'null',
  Disabled = 'disabled',
}

export enum IncentiveStatusEnum {
  Draft = 'draft',
  Valitated = 'validated',
  Warning = 'warning',
  Error = 'error',
}

export interface MetadataVariableDefinition {
  uuid: string;
  name?: string;
  scope?: string;
  initialValue?: number;
  lifetime?: MetadataLifetime;
}

export interface MetadataVariableExport {
  uuid: string;
  key: string;
  lifetime?: MetadataLifetime;
  initialValue?: number;
}

export interface MetadataVariable extends MetadataVariableExport {
  policy_id: number;
  datetime: Date;
  value: number;
}

interface MetadataCommonInterface {
  datetime: Date;
}

export interface MetadataRegistryInterface extends MetadataCommonInterface {
  policy_id: number;
  register(variable: MetadataVariableDefinition): void;
  export(): Array<MetadataVariableExport>;
}

export interface MetadataExport {
  key: string;
  value: number;
}

export interface MetadataAccessorInterface extends MetadataCommonInterface {
  get(uuid: string): number;
  set(uuid: string, data: number): void;
  export(): Array<MetadataExport>;
}

export interface SerializedMetaInterface extends MetadataExport {
  policy_id: number;
  datetime: Date;
}

export interface MetadataStoreInterface {
  load(registry: MetadataRegistryInterface): Promise<MetadataAccessorInterface>;
  save(data: MetadataAccessorInterface): Promise<void>;
  store(lifetime: MetadataLifetime): Promise<Array<SerializedMetaInterface>>;
}

export interface SerializedIncentiveInterface {
  _id: number;
  policy_id: number;
  carpool_id: number;
  datetime: Date;
  statelessAmount: number;
  statefulAmount: number;
  status: IncentiveStatusEnum;
  state: IncentiveStateEnum;
  meta: Array<MetadataVariableExport>;
}

interface CommonIncentiveInterface {
  get(): number;
  set(amount: number): void;
  export(): SerializedIncentiveInterface;
}

export interface StatelessIncentiveInterface extends CommonIncentiveInterface {
  setMeta(registry: MetadataRegistryInterface): void;
}

export interface StatefulIncentiveInterface extends CommonIncentiveInterface {
  getMeta(): MetadataRegistryInterface;
}

export interface StatefulContextInterface {
  incentive: StatefulIncentiveInterface;
  meta: MetadataAccessorInterface;
}

export interface StatelessContextInterface {
  incentive: StatelessIncentiveInterface;
  meta: MetadataRegistryInterface;
  carpool: CarpoolInterface;
}

export interface StepInterface {
  start: number;
  end: number;
}

export interface PolicyRulesStaticInterface {
  new (): PolicyRulesInterface;
}

export interface PolicyRulesInterface<P = StepRuleInterface> {
  processStateless(context: StatelessContextInterface): void;
  processStateful(context: StatefulContextInterface): void;
  describe(): Array<P>;
  describeForHuman(): string;
}

export type StatelessRuleHelper<P> = (ctx: StatelessContextInterface, params: P) => boolean;

export interface SerializedPolicyInterface {
  _id: number;
  territory_id: number;
  name: string;
  start_date: Date;
  end_date: Date;
  uses: string;
  status: string;
}

export interface PolicyInterface {
  _id: number;
  territory_id: number;
  name: string;
  start_date: Date;
  end_date: Date;
  uses: PolicyRulesInterface;
  status: string;

  processStateless(carpool: CarpoolInterface): Promise<StatelessIncentiveInterface>;
  processStateful(
    store: MetadataStoreInterface,
    incentive: SerializedIncentiveInterface,
  ): Promise<StatefulIncentiveInterface>;
}
