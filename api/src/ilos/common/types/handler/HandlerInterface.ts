import {
  CallType,
  ContextType,
  ParamsType,
  ResultType,
} from "../call/index.ts";

export interface HandlerInterface {
  readonly middlewares?: (string | [string, any])[];

  /**
   * Handler, put here your business logic
   * @param {CallType} call
   * @returns {Promise<ResultType>}
   * @memberof HandlerInterface
   */
  call(call: CallType): Promise<ResultType>;
}

export type FunctionalHandlerInterface<
  P = ParamsType,
  C = ContextType,
  R = ResultType,
> = (
  call: CallType<P, C, R>,
) => Promise<R>;
