export type FraudCheckResult = number;

export enum FraudCheckStatusEnum {
  Done = 'done',
  Error = 'error',
  Pending = 'pending',
}

export interface FraudCheckIdentifier {
  method: string;
}

export interface FraudCheckData {
  karma: FraudCheckResult;
  meta: any;
}

export interface FraudCheck extends FraudCheckIdentifier, Partial<FraudCheckData> {
  status: FraudCheckStatusEnum;
}

export interface FraudCheckEntry {
  acquisition_id: number;
  status: FraudCheckStatusEnum;
  karma: FraudCheckResult;
  data: FraudCheck[];
}
