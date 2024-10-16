import { NextFunction } from "@/deps.ts";
import {
  ContextType,
  MiddlewareInterface,
  ParamsType,
  ResultType,
} from "@/ilos/common/index.ts";

type middlewareInstancesWithOptionsType =
  (MiddlewareInterface | [MiddlewareInterface, any])[];
export function compose(
  middlewareInstancesWithOptions: middlewareInstancesWithOptionsType,
): NextFunction {
  if (!Array.isArray(middlewareInstancesWithOptions)) {
    throw new TypeError("Middleware stack must be an array!");
  }

  const middlewares: NextFunction[] = [];

  for (const middlewareInstanceWithOptions of middlewareInstancesWithOptions) {
    let options: any;
    let middlewareInstance: MiddlewareInterface;

    if (Array.isArray(middlewareInstanceWithOptions)) {
      [middlewareInstance, options] = middlewareInstanceWithOptions;
    } else {
      middlewareInstance = middlewareInstanceWithOptions;
    }

    middlewares.push((
      params: ParamsType,
      context: ContextType,
      next?: NextFunction,
    ) => middlewareInstance.process(params, context, next, options));
  }

  return async function (
    params: ParamsType,
    context: ContextType,
    next?: NextFunction,
  ): Promise<ResultType> {
    // last called middleware #
    let index = -1;

    function dispatch(i: number) {
      if (!next) {
        throw new TypeError("No next function provided to middleware stack!");
      }

      if (i <= index) {
        throw new Error("next() called multiple times");
      }

      index = i;
      let fn = middlewares[i];
      if (i === middlewares.length) fn = next;
      return (p: ParamsType, c: ContextType) => fn(p, c, dispatch(i + 1));
    }

    return dispatch(0)(params, context);
  };
}
