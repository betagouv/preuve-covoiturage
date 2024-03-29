import { ContextType, MiddlewareInterface, ParamsType, ResultType, middleware } from '@ilos/common';
import { get, set } from 'lodash';
import { ConfiguredMiddleware } from '../interfaces';

/*
 * CastToArrayMiddleware middleware and its companion helper function
 * castToArrayMiddleware are used to cast one or many properties
 * to an array.
 *
 * Not found or undefined props are skipped.
 */
@middleware()
export class CastToArrayMiddleware implements MiddlewareInterface<HelperArgs> {
  async process(params: ParamsType, context: ContextType, next: Function, helperArgs: HelperArgs): Promise<ResultType> {
    const paths = Array.isArray(helperArgs) ? helperArgs : [helperArgs];

    for (const path of paths) {
      // make sure the property path exists
      // using a symbol is a safer equality check than undefined
      // and preserves null values
      const notFound = Symbol();
      const oldValue = get(params, path, notFound);

      // skip the cast if the property is not found
      if (oldValue === notFound) {
        continue;
      }

      // cast the property to an array
      set(params, path, Array.isArray(oldValue) ? oldValue : [oldValue]);
    }

    return next(params, context);
  }
}

type PropertyPath = string;
export type HelperArgs = PropertyPath | PropertyPath[];

const alias = 'cast.to_array';

export const castToArrayMiddlewareBinding = [alias, CastToArrayMiddleware];

export function castToArrayMiddleware(properties: HelperArgs): ConfiguredMiddleware<HelperArgs> {
  return [alias, properties];
}
