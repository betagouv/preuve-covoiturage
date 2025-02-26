import {
  ContextType,
  ForbiddenException,
  InvalidParamsException,
  middleware,
  MiddlewareInterface,
  ParamsType,
  ResultType,
} from "@/ilos/common/index.ts";
import { get } from "@/lib/object/index.ts";
import { NextFunction } from "dep:express";
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
    next: NextFunction,
    neededPermissions: HasPermissionMiddlewareParams,
  ): Promise<ResultType> {
    if (!Array.isArray(neededPermissions) || neededPermissions.length === 0) {
      throw new InvalidParamsException("No permissions defined");
    }

    const permissions = get(context, "call.user.permissions", []);

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

/**
 * Define allowed permissions to access the handler.
 *
 * User's permissions are extracted from context.user.permissions. The list
 * must contain permissions from the middleware configuration.
 *
 * @param params - list of allowed permissions
 */
export function hasPermissionMiddleware(
  ...params: HasPermissionMiddlewareParams
): ConfiguredMiddleware<HasPermissionMiddlewareParams> {
  return [alias, params];
}
