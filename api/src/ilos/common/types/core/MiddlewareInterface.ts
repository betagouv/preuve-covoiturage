import { ContextType, ParamsType, ResultType } from "../call/index.ts";

export type NextFunction = (
  params: ParamsType,
  context: ContextType,
) => Promise<ResultType>;

export interface MiddlewareInterface<T = any> {
  process(
    params: ParamsType,
    context: ContextType,
    next?: NextFunction,
    options?: T,
  ): Promise<ResultType>;
}

export type FunctionMiddlewareInterface = (
  params: ParamsType,
  context: ContextType,
  next?: NextFunction,
) => Promise<ResultType>;
