import { FraudCheckResult } from './FraudCheck';

export interface CheckInterface<R = any> {
  init?():Promise<void>;
  handle(acquisitionId: number, meta?: R): Promise<FraudCheckResult<R>>;
};

export interface StaticCheckInterface {
  readonly key: string;
  new(...args: any[]): CheckInterface;
};
