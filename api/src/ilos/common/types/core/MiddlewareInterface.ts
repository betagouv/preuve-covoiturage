import { ContextType, ParamsType, ResultType } from "../call/index.ts";

export interface MiddlewareInterface<T = any> {
  process(
    params: ParamsType,
    context: ContextType,
    next?: FunctionMiddlewareInterface,
    options?: T,
  ): Promise<ResultType>;
}

export type FunctionMiddlewareInterface = (
  params: ParamsType,
  context: ContextType,
  next?: FunctionMiddlewareInterface,
) => Promise<ResultType>;
