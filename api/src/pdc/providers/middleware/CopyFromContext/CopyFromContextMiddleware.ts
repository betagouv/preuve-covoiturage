import {
  ContextType,
  middleware,
  MiddlewareInterface,
  ParamsType,
  ResultType,
} from "@/ilos/common/index.ts";
import { get, set } from "@/lib/object/index.ts";
import { ConfiguredMiddleware } from "../interfaces.ts";

/*
 * Extract data from context and copy to request params
 */
@middleware()
export class CopyFromContextMiddleware
  implements MiddlewareInterface<CopyFromContextMiddlewareParams> {
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

const alias = "copy.from_context";

export const copyFromContextMiddlewareBinding = [
  alias,
  CopyFromContextMiddleware,
];

/**
 * Copy context data to request params

 *
 * @param fromPath - the path in the context to copy from
 * @param toPath - the path in the request params to copy to
 * @param preserve - whether to preserve the existing value
 *                             in the request params or override it
 *
 * @example
 * middlewares: [
 *   // override the operator_id to scope the request to the owner if it is
 *   // an operator.
 *   copyFromContextMiddleware("call.user.operator_id", "operator_id", false),
 *
 *   // copy the user id to the created_by field only if it is not already set
 *   // in the request params.
 *   copyFromContextMiddleware("call.user._id", "created_by", true),
 * ],
 *
 */
export function copyFromContextMiddleware(
  fromPath: string,
  toPath: string,
  preserve = false,
): ConfiguredMiddleware<CopyFromContextMiddlewareParams> {
  return [alias, [fromPath, toPath, preserve]];
}
