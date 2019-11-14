export interface FraudCheck<T = any> {
  _id: number;
  status: string;
  meta: T;
  karma: number;
}
