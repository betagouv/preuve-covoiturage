import { _ } from "@/deps.ts";
import {
  ContextType,
  ForbiddenException,
  InvalidParamsException,
  middleware,
  MiddlewareInterface,
  ParamsType,
  ResultType,
} from "@/ilos/common/index.ts";
import { ConfiguredMiddleware } from "../interfaces.ts";

/**
 * Check if user has all listed permission
 */
@middleware()
export class HasPermissionMiddleware
  implements MiddlewareInterface<HasPermissionMiddlewareParams> {
  async process(
    params: ParamsType,
    context: ContextType,
    next: Function,
    neededPermissions: HasPermissionMiddlewareParams,
  ): Promise<ResultType> {
    if (!Array.isArray(neededPermissions) || neededPermissions.length === 0) {
      throw new InvalidParamsException("No permissions defined");
    }

    const permissions = _.get(context, "call.user.permissions", []);

    if (permissions.length === 0) {
      throw new ForbiddenException("Invalid permissions");
    }

    const pass = neededPermissions.reduce(
      (p, c) => p && (permissions || []).indexOf(c) > -1,
      true,
    );

    if (!pass) {
      throw new ForbiddenException("Invalid permissions");
    }

    return next(params, context);
  }
}

export type HasPermissionMiddlewareParams = string[];

const alias = "has_permission";

export const hasPermissionMiddlewareBinding = [alias, HasPermissionMiddleware];

export function hasPermissionMiddleware(
  ...params: HasPermissionMiddlewareParams
): ConfiguredMiddleware<HasPermissionMiddlewareParams> {
  return [alias, params];
}
