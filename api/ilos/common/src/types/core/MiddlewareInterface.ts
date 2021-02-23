import { ParamsType, ResultType, ContextType } from '../call';

export interface MiddlewareInterface<T=any> {
  process(params: ParamsType, context: ContextType, next?: Function, options?: T): Promise<ResultType>;
}

export type FunctionMiddlewareInterface = (
  params: ParamsType,
  context: ContextType,
  next?: Function,
) => Promise<ResultType>;
