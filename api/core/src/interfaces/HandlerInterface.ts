import { CallType } from '../types/CallType';
import { ResultType } from '../types/ResultType';
import { ContainerInterface } from '../container';

export interface HandlerInterface {
  readonly middlewares?: (string | [string, any])[];

  /**
   * Boot is the first method called after constructor
   */
  boot(container?: ContainerInterface): Promise<void> | void;

  /**
   * Handler, put here your business logic
   */
  call(call: CallType): Promise<ResultType>;
}
