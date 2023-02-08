export type FraudCheckResult = number;

export enum FraudCheckStatusEnum {
  Done = 'done',
  Error = 'error',
  Pending = 'pending',
}

export interface FraudCheck {
  acquisition_id: number;
  method: string;
  uuid: string;
  status: FraudCheckStatusEnum;
  karma: FraudCheckResult;
  data?: any;
}

export interface FraudCheckEntry {
  acquisition_id: number;
  status: FraudCheckStatusEnum;
  karma: FraudCheckResult;
  data: FraudCheck[];
}
