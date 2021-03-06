import { get, set } from 'lodash';
import { middleware, MiddlewareInterface, ParamsType, ContextType, ResultType } from '@ilos/common';
import { ConfiguredMiddleware } from '../interfaces';

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
    const newParams = params ?? {};

    const [fromPath, toPath, preserve] = mappings;
    const notFound = Symbol();
    const valueToCopy = get(context, fromPath, notFound);

    if (valueToCopy !== notFound && valueToCopy !== null) {
      if (!preserve || get(newParams, toPath, notFound) === notFound) {
        set(newParams, toPath, valueToCopy);
      }
    }

    return next(newParams, context);
  }
}

export type CopyFromContextMiddlewareParams = [string, string, boolean];

const alias = 'copy.from_context';

export const copyFromContextMiddlewareBinding = [alias, CopyFromContextMiddleware];

export function copyFromContextMiddleware(
  fromPath: string,
  toPath: string,
  preserve = false,
): ConfiguredMiddleware<CopyFromContextMiddlewareParams> {
  return [alias, [fromPath, toPath, preserve]];
}
