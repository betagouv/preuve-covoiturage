import { MetadataRegistryInterface, SerializedMetadataVariableDefinitionInterface } from '.';

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

export interface SerializedIncentiveInterface {
  _id: number;
  policy_id: number;
  carpool_id: number;
  datetime: Date;
  statelessAmount: number;
  statefulAmount: number;
  status: IncentiveStatusEnum;
  state: IncentiveStateEnum;
  meta: Array<SerializedMetadataVariableDefinitionInterface>;
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
