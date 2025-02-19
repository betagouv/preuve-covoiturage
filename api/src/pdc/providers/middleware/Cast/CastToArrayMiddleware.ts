import {
  ContextType,
  middleware,
  MiddlewareInterface,
  ParamsType,
  ResultType,
} from "@/ilos/common/index.ts";
import { get, set } from "@/lib/object/index.ts";
import { NextFunction } from "dep:express";
import { ConfiguredMiddleware } from "../interfaces.ts";

@middleware()
export class CastToArrayMiddleware implements MiddlewareInterface<HelperArgs> {
  async process(
    params: ParamsType,
    context: ContextType,
    next: NextFunction,
    helperArgs: HelperArgs,
  ): Promise<ResultType> {
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
      if (oldValue !== undefined) {
        set(params, path, Array.isArray(oldValue) ? oldValue : [oldValue]);
      }
    }

    return next(params, context);
  }
}

type PropertyPath = string;
export type HelperArgs = PropertyPath | PropertyPath[];

const alias = "cast.to_array";

export const castToArrayMiddlewareBinding = [alias, CastToArrayMiddleware];

/**
 * Cast one or many properties to an array. Not found or undefined props are skipped.
 *
 * @param properties - single or array of multiple properties to cast to an array
 *
 * @example
 * middlewares: [
 *   castToArrayMiddleware(["operator_id", "territory_id", "recipients"]),
 * ],
 */
export function castToArrayMiddleware(
  properties: HelperArgs,
): ConfiguredMiddleware<HelperArgs> {
  return [alias, properties];
}
