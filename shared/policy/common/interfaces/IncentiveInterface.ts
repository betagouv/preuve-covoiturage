import { SerializedMetadataVariableDefinitionInterface, MetadataRegistryInterface } from './MetadataInterface';

export enum IncentiveStateEnum {
  Regular = 'regular',
  Null = 'null',
  Disabled = 'disabled',
}

export enum IncentiveStatusEnum {
  Draft = 'draft',
  Pending = 'pending',
  Valitated = 'validated',
  Warning = 'warning',
  Error = 'error',
}

export interface SerializedIncentiveInterface<T = number> {
  _id: T;
  policy_id: number;
  carpool_id: number;
  datetime: Date;
  statelessAmount: number;
  statefulAmount: number;
  status: IncentiveStatusEnum;
  state: IncentiveStateEnum;
  meta: Array<SerializedMetadataVariableDefinitionInterface>;
}

export interface CommonIncentiveInterface {
  get(): number;
  set(amount: number): void;
}

export interface StatelessIncentiveInterface extends CommonIncentiveInterface {
  export(): SerializedIncentiveInterface<undefined>;
  setMeta(registry: MetadataRegistryInterface): void;
}

export interface StatefulIncentiveInterface extends CommonIncentiveInterface {
  export(): SerializedIncentiveInterface<number>;
  getMeta(): MetadataRegistryInterface;
}

export type IncentiveMetaInterface =
  | Record<string, string>
  | {
      _extra?: Record<string, number>;
    };

export interface IncentiveInterface {
  carpool_id: number;
  policy_id: number;
  datetime: Date;
  result: number;
  amount: number;
  state: IncentiveStateEnum;
  status: IncentiveStatusEnum;
  meta: IncentiveMetaInterface;
}
