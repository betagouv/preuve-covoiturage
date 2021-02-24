import { get, set } from 'lodash';
import { middleware, MiddlewareInterface, ParamsType, ContextType, ResultType } from '@ilos/common';
import { ParametredMiddleware } from '../interfaces';

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
    const [fromPath, toPath, preserve] = mappings;
    const notFound = Symbol();
    const valueToCopy = get(context, fromPath, notFound);

    if (valueToCopy !== notFound) {
      if (!preserve || get(params, toPath, notFound) === notFound) {
        set(params, toPath, valueToCopy);
      }
    }

    return next(params, context);
  }
}

export type CopyFromContextMiddlewareParams = [string, string, boolean];

const alias = 'copy_from_context';

export const copyFromContextMiddlewareBinding = [alias, CopyFromContextMiddleware];

export function copyFromContextMiddleware(
  fromPath: string,
  toPath: string,
  preserve = false,
): ParametredMiddleware<CopyFromContextMiddlewareParams> {
  return [alias, [fromPath, toPath, preserve]];
}
