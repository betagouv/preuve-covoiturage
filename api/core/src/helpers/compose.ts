import { ParamsType, ResultType, ContextType } from '../types';
import { MiddlewareInterface, FunctionMiddlewareInterface } from '../interfaces/MiddlewareInterface';

type middlewareInstancesWithOptionsType = (MiddlewareInterface | [MiddlewareInterface, any])[];
export function compose(middlewareInstancesWithOptions: middlewareInstancesWithOptionsType):FunctionMiddlewareInterface {
  if (!Array.isArray(middlewareInstancesWithOptions)) {
    throw new TypeError('Middleware stack must be an array!');
  }

  const middlewares: FunctionMiddlewareInterface[] = [];

  for (const middlewareInstanceWithOptions of middlewareInstancesWithOptions) {
    let options: any;
    let middlewareInstance: MiddlewareInterface;

    if (Array.isArray(middlewareInstanceWithOptions)) {
      [middlewareInstance, options] = middlewareInstanceWithOptions;
    } else {
      middlewareInstance = middlewareInstanceWithOptions;
    }

    middlewares.push(
      (params: ParamsType, context: ContextType, next?: FunctionMiddlewareInterface) =>
        middlewareInstance.process(params, context, next, options),
    );
  }

  return async function (params: ParamsType, context: ContextType, handle: FunctionMiddlewareInterface): Promise<ResultType> {
    // last called middleware #
    let index = -1;
    return dispatch(0)(params, context);
    function dispatch(i: number) {
      if (i <= index) {
        throw new Error('next() called multiple times');
      }
      index = i;
      let fn = middlewares[i];
      if (i === middlewares.length) fn = handle;
      return (p: ParamsType, c: ContextType) => fn(p, c, dispatch(i + 1));
    }
  };
}
