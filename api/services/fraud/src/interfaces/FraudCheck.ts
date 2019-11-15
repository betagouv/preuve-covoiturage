export interface FraudCheckMeta<T = any> {
  meta: T;
}

export interface FraudCheckResult<T = any> extends FraudCheckMeta<T> {
  karma: number;
}

export interface FraudCheck<T = any> extends FraudCheckResult<T> {
  _id: number;
  status: string;
}
