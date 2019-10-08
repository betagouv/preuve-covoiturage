export interface FraudCheck<T = any> {
  _id: string;
  status: string;
  meta: T;
  karma: number;
}
