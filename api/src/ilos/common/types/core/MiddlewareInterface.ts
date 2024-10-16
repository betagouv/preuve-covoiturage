import { NextFunction } from "@/deps.ts";
import { ContextType, ParamsType, ResultType } from "../call/index.ts";

export interface MiddlewareInterface<T = unknown> {
  process(
    params: ParamsType,
    context: ContextType,
    next?: NextFunction,
    options?: T,
  ): Promise<ResultType>;
}
