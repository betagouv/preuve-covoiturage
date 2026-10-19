import {
  ContextType,
  ForbiddenException,
  middleware,
  MiddlewareInterface,
  ParamsType,
  ResultType,
} from "@/ilos/common/index.ts";
import { get } from "@/lib/object/index.ts";
import { ConfiguredMiddleware } from "@/pdc/providers/middleware/interfaces.ts";
import { NextFunction } from "dep:express";

// Un identifiant de périmètre soumis par l'appelant, avant le passage en tableau.
function asIds(value: unknown): number[] {
  if (value == null) return [];
  return (Array.isArray(value) ? value : [value]).map(Number).filter((n) => !Number.isNaN(n));
}

// Périmètre demandé = absent ou celui de la session ; registry.admin non concerné.
@middleware()
export class OwnScopeGuardMiddleware implements MiddlewareInterface {
  async process(params: ParamsType, context: ContextType, next: NextFunction): Promise<ResultType> {
    const own = {
      operator_id: get(context, "call.user.operator_id", null) as number | null,
      territory_id: get(context, "call.user.territory_id", null) as number | null,
    };

    for (const field of ["operator_id", "territory_id"] as const) {
      if (own[field] == null) continue;
      const asked = asIds(get(params, field, null));
      if (asked.some((id) => id !== own[field])) {
        throw new ForbiddenException(`Export limité à votre ${field === "operator_id" ? "opérateur" : "territoire"}`);
      }
    }

    return next(params, context);
  }
}

const alias = "export.own_scope_guard";

export const ownScopeGuardMiddlewareBinding = [alias, OwnScopeGuardMiddleware];

export function ownScopeGuardMiddleware(): ConfiguredMiddleware<undefined> {
  return [alias, undefined];
}
