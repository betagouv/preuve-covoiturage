import { FraudCheckResult } from './FraudCheck';
import { NewableType } from '@ilos/common';

export type CheckHandleCallback = (karma: FraudCheckResult, acquisition_id?: number, data?: any) => void;
export interface PrepareCheckInterface<P = any> {
  prepare(acquisitionId: number): Promise<P | undefined>;
}

interface HandleInterface<P> {
  handle(data: P, cb: CheckHandleCallback): Promise<void>;
}

export interface HandleCheckInterface<P = any> extends HandleInterface<P> {
  readonly preparer: NewableType<PrepareCheckInterface<P>>;
}

export interface CheckInterface<P = any> extends PrepareCheckInterface<P>, HandleInterface<P> {}

export interface StaticCheckInterface {
  readonly key: string;
  new (...args: any[]): CheckInterface | HandleCheckInterface;
}
