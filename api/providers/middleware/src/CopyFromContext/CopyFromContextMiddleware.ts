import { get, set } from 'lodash';
import { middleware, MiddlewareInterface, ParamsType, ContextType, ResultType } from '@ilos/common';

export type CopyFromContextMiddlewareParams = [string, string];
/*
 * Extract data from context and copy to request params
 */
@middleware()
export class CopyFromContextMiddleware implements MiddlewareInterface<CopyFromContextMiddlewareParams> {
  async process(
    params: ParamsType,
    context: ContextType,
    next: Function,
    mappings: CopyFromContextMiddlewareParams,
  ): Promise<ResultType> {
    const [fromPath, toPath] = mappings;
    const notFound = Symbol();
    const valueToCopy = get(context, fromPath, notFound);

    if (valueToCopy !== notFound) {
      set(params, toPath, valueToCopy);
    }

    return next(params, context);
  }
}
