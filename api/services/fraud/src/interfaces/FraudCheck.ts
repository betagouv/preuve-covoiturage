export type FraudCheckResult = number;

export enum FraudCheckStatusEnum {
  Done = 'done',
  Error = 'error',
  Pending = 'pending',
}

export interface FraudCheckIdentifier {
  method: string;
  acquisition_id: number;
}

export interface FraudCheckData {
  karma: FraudCheckResult;
  error: any;
}

export interface FraudCheck extends FraudCheckIdentifier, Partial<FraudCheckData> {
  status: FraudCheckStatusEnum;
}
