import { get, set } from 'lodash';
import { middleware, MiddlewareInterface, ParamsType, ContextType, ResultType } from '@ilos/common';

/*
 * Delete properties from model or array of models on output of handler
 */
@middleware()
export class ContextExtractMiddleware implements MiddlewareInterface {
  async process(
    params: ParamsType,
    context: ContextType,
    next: Function,
    mappings: { [key: string]: string },
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
