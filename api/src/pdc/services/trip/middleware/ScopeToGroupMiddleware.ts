import { NextFunction } from "@/deps.ts";
import {
  ContextType,
  ForbiddenException,
  InvalidParamsException,
  middleware,
  MiddlewareInterface,
  ParamsType,
  ResultType,
} from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import { ConfiguredMiddleware } from "@/pdc/providers/middleware/index.ts";
import {
  TerritorySelectorsInterface,
} from "@/shared/territory/common/interfaces/TerritoryCodeInterface.ts";

export type ScopeToGroupMiddlewareParams = {
  registry: string;
  territory: string;
  operator: string;
};

interface ParamsInterface extends ParamsType {
  geo_selector: TerritorySelectorsInterface;
}

@middleware()
export class ScopeToGroupMiddleware implements MiddlewareInterface {
  constructor(public connection: PostgresConnection) {}

  async process(
    params: Partial<ParamsInterface>,
    context: ContextType,
    next: NextFunction,
    options: ScopeToGroupMiddlewareParams,
  ): Promise<ResultType> {
    const _params = await this.unnestComCode({ geo_selector: {}, ...params });
    const {
      registry: basePermission,
      territory: territoryPermission,
      operator: operatorPermission,
    } = options;

    if (!basePermission || !territoryPermission || !operatorPermission) {
      throw new InvalidParamsException("No permissions defined");
    }

    let permissions = [];

    if (
      context.call && context.call.user &&
      context.call.user.permissions &&
      context.call.user.permissions.length
    ) {
      permissions = context.call.user.permissions;
    }

    if (permissions.length === 0) {
      throw new ForbiddenException("Invalid permissions");
    }

    // If the user has  basePermission --> OK
    if (permissions.indexOf(basePermission) > -1) {
      return next(_params, context);
    }

    // if user group is territory and have territory permission
    if (
      context.call && context.call.user &&
      context.call.user.territory_id &&
      permissions.indexOf(territoryPermission) > -1
    ) {
      const normalizedParams = { ..._params };

      // if _params doest have geo selectore, add it
      if (!_params.geo_selector.com?.length) {
        normalizedParams.geo_selector.com =
          context.call.user.authorizedZoneCodes.com;
      }
      // check if all territory_id in _params are in authorized territories
      const authorizedTerritories = context.call.user.authorizedZoneCodes?.com;
      if (
        Array.isArray(authorizedTerritories) &&
        Array.isArray(normalizedParams.geo_selector.com) &&
        authorizedTerritories.length > 0 &&
        normalizedParams.geo_selector.com.filter((id) =>
            authorizedTerritories.indexOf(id) < 0
          ).length === 0
      ) {
        return next(normalizedParams, context);
      }
    }

    // if user group is operator and have operator permission
    if (
      context.call && context.call.user &&
      context.call.user.operator_id &&
      permissions.indexOf(operatorPermission) > -1
    ) {
      const normalizedParams = { ..._params };

      // if _params doest have operator_id, add it
      if (!_params.operator_id || !_params.operator_id.length) {
        normalizedParams.operator_id = [context.call.user.operator_id];
      }

      // check if operator_id in params is context operator_id
      if (
        Array.isArray(normalizedParams.operator_id) &&
        normalizedParams.operator_id.length === 1 &&
        normalizedParams.operator_id.indexOf(context.call.user.operator_id) !==
          -1
      ) {
        return next(normalizedParams, context);
      }
    }

    throw new ForbiddenException("Invalid permissions");
  }

  protected async unnestComCode(
    params: ParamsInterface,
  ): Promise<ParamsInterface> {
    const queries = Object.keys(params.geo_selector)
      .map((code: unknown, i: number) => ({
        text: `
          SELECT distinct arr AS com
          FROM geo.perimeters
          WHERE ${code} = ANY($${i + 1}::varchar[])
          AND year = geo.get_latest_millesime()
        `,
        // @ts-ignore
        values: params.geo_selector[code] as string[],
      }))
      .reduce(
        (res, i: { text: string; values: string[] }) => {
          res.text.push(i.text);
          res.values.push(i.values);
          return res;
        },
        { text: [], values: [] } as {
          text: string[];
          values: string[][];
        },
      );

    if (!queries.text.length) {
      return params;
    }

    const res = await this.connection.getClient().query({
      text: queries.text.join(" UNION "),
      values: queries.values,
    });

    const com = res.rows.map((r) => r.com);
    return { ...params, geo_selector: { ...params.geo_selector, com } };
  }
}

const alias = "scopeToGroup";

export const scopeToGroupBinding = [alias, ScopeToGroupMiddleware];

export function scopeToGroupMiddleware(
  params: ScopeToGroupMiddlewareParams,
): ConfiguredMiddleware<ScopeToGroupMiddlewareParams> {
  return [alias, params];
}
