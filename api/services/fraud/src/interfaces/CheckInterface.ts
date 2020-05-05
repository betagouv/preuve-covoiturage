import { FraudCheckResult } from './FraudCheck';
import { NewableType } from '@ilos/common';

export interface PrepareCheckInterface<P = any> {
  prepare(acquisitionId: number): Promise<P[]>;
}

interface HandleInterface<P> {
  handle(data: P): Promise<FraudCheckResult>;
}
export interface HandleCheckInterface<P = any> extends HandleInterface<P> {
  readonly preparer: NewableType<PrepareCheckInterface<P>>;
}

export interface CheckInterface<P = any> extends PrepareCheckInterface<P>, HandleInterface<P> {}

export interface StaticCheckInterface {
  readonly key: string;
  new (...args: any[]): CheckInterface | HandleCheckInterface;
}
