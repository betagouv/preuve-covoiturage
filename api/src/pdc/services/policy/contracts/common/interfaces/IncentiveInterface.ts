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
