import { get, set } from 'lodash';
import { middleware, MiddlewareInterface, ParamsType, ContextType, ResultType } from '@ilos/common';

export interface ContextExtractMiddlewareParams {
  [key: string]: string;
}
/*
 * Extract data from context and copy to request params
 */
@middleware()
export class ContextExtractMiddleware implements MiddlewareInterface<ContextExtractMiddlewareParams> {
  async process(
    params: ParamsType,
    context: ContextType,
    next: Function,
    mappings: ContextExtractMiddlewareParams,
  ): Promise<ResultType> {
    if (Object.keys(mappings).length) {
      for (const [key, path] of Object.entries(mappings)) {
        const val = get(context, path, null);
        if (val !== null) {
          set(params, key, val);
        }
      }
    }

    return next(params, context);
  }
}
