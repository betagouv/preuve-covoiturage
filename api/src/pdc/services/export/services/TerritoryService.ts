import { KernelInterfaceResolver, provider } from "@/ilos/common/index.ts";
import { Options } from "../commands/CreateCommand.ts";
import {
  TerritoryCodeEnum,
  TerritorySelectorsInterface,
} from "@/shared/territory/common/interfaces/TerritoryCodeInterface.ts";

export type ResolveParams = Partial<Pick<Options, "territory_id" | "geo">>;
export type ResolveResults = TerritorySelectorsInterface;

export type TerritoryServiceInterface = {
  resolve(params: ResolveParams): Promise<ResolveResults>;
};

export abstract class TerritoryServiceInterfaceResolver
  implements TerritoryServiceInterface {
  public async resolve(params: ResolveParams): Promise<ResolveResults> {
    throw new Error("Not implemented");
  }
}

@provider({
  identifier: TerritoryServiceInterfaceResolver,
})
export class TerritoryService {
  protected readonly defaultResolveResult = {
    [TerritoryCodeEnum.Country]: ["XXXXX"],
  }; // FRANCE

  constructor(protected kernel: KernelInterfaceResolver) {}

  /**
   * Resolve to a geo_selector from a `territory_id` or a `geo_selector`.
   *
   * `territory_id` might differ from an administrative geographical division.
   * When given both params, `geo_selector` takes precedence
   */
  public async resolve(params: ResolveParams): Promise<ResolveResults> {
    // select the whole country if all params are missing
    if (
      Object.keys(params).filter((k) =>
          params[k] !== null && typeof params[k] !== "undefined"
        ).length === 0 ||
      ("geo" in params && Object.keys(params.geo).length === 0)
    ) {
      return this.defaultResolveResult;
    }

    // TODO add support for territory_id
    // use the territory service to get geo_selectors from the territory_id / territory SIREN

    const { geo } = params;
    const selectors = geo.reduce(
      (p, c) => {
        const [type, code] = c.split(":").map((s) =>
          String(s).toLowerCase().trim()
        );

        switch (type as TerritoryCodeEnum) {
          case TerritoryCodeEnum.City:
            p[TerritoryCodeEnum.City].push(code);
            break;
          case TerritoryCodeEnum.Mobility:
            p[TerritoryCodeEnum.Mobility].push(code);
            break;
          case TerritoryCodeEnum.CityGroup:
            p[TerritoryCodeEnum.CityGroup].push(code);
            break;
          case TerritoryCodeEnum.District:
            p[TerritoryCodeEnum.District].push(code);
            break;
          case TerritoryCodeEnum.Region:
            p[TerritoryCodeEnum.Region].push(code);
            break;
          case TerritoryCodeEnum.Country:
            p[TerritoryCodeEnum.Country].push(code);
            break;
        }

        return p;
      },
      {
        [TerritoryCodeEnum.City]: [],
        [TerritoryCodeEnum.Mobility]: [],
        [TerritoryCodeEnum.CityGroup]: [],
        [TerritoryCodeEnum.District]: [],
        [TerritoryCodeEnum.Region]: [],
        [TerritoryCodeEnum.Country]: [],
      } as TerritorySelectorsInterface,
    );

    // clean up empty selectors
    Object.keys(selectors).forEach((key) => {
      if (selectors[key].length === 0) {
        delete selectors[key];
      }
    });

    return Object.keys(selectors).length
      ? selectors
      : this.defaultResolveResult;
  }
}
