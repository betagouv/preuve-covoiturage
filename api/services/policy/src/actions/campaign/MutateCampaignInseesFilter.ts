import { KernelInterfaceResolver, provider } from '@ilos/common';
import { TerritoryCodeEnum } from '../../shared/territory/common/interfaces/TerritoryCodeInterface';

import { RuleInterface } from '../../engine/interfaces';
import { ParamsInterface, ResultInterface, signature } from '../../shared/territory/findGeoByCode.contract';

@provider()
export class MutateCampaignInseesFilter {
  constructor(private readonly kernel: KernelInterfaceResolver) {}
  async call(global_rules: RuleInterface[]): Promise<RuleInterface[]> {
    const inseeBlacklistFilterRules: RuleInterface = global_rules.find((r) => r.slug === 'territory_blacklist_filter');
    const inseeWhitelistFilterRules: RuleInterface = global_rules.find((r) => r.slug === 'territory_whitelist_filter');

    if (!inseeBlacklistFilterRules && !inseeWhitelistFilterRules) {
      return global_rules;
    }
    if (inseeBlacklistFilterRules && inseeBlacklistFilterRules.parameters) {
      inseeBlacklistFilterRules.parameters = await this.territoryFiltersWithName(inseeBlacklistFilterRules);
    }
    if (inseeWhitelistFilterRules && inseeWhitelistFilterRules.parameters) {
      inseeWhitelistFilterRules.parameters = await this.territoryFiltersWithName(inseeWhitelistFilterRules);
    }
    return global_rules;
  }

  private async territoryFiltersWithName(territoryFilterRules: RuleInterface) {
    const params: ParamsInterface = {
      epci: territoryFilterRules.parameters.flatMap((s) => this.concatStartEndInsee(s.start?.epci, s.end?.epci)),
      aom: territoryFilterRules.parameters.flatMap((s) => this.concatStartEndInsee(s.start?.aom, s.end?.aom)),
      com: territoryFilterRules.parameters.flatMap((s) => this.concatStartEndInsee(s.start?.com, s.end?.com)),
    };

    if (params.aom.length === 0 && params.epci.length === 0 && params.com.length === 0) {
      return territoryFilterRules.parameters;
    }

    let selectors: ResultInterface;
    try {
      selectors = await this.kernel.call<ParamsInterface, ResultInterface>(signature, params, {
        channel: { service: 'policy' },
      });
    } catch (e) {
      console.error(e);
      return territoryFilterRules.parameters;
    }

    return territoryFilterRules.parameters.map((p) => {
      if (p.start.epci) {
        p.start.epci = p.start.epci.map((e) => this.findTerritoryInsee(selectors, TerritoryCodeEnum.CityGroup, e));
      }
      if (p.end.epci) {
        p.end.epci = p.end.epci.map((e) => this.findTerritoryInsee(selectors, TerritoryCodeEnum.CityGroup, e));
      }
      if (p.start.aom) {
        p.start.aom = p.start.aom.map((e) => this.findTerritoryInsee(selectors, TerritoryCodeEnum.Mobility, e));
      }
      if (p.end.aom) {
        p.end.aom = p.end.aom.map((e) => this.findTerritoryInsee(selectors, TerritoryCodeEnum.Mobility, e));
      }
      if (p.start.com) {
        p.start.com = p.start.com.map((e) => this.findTerritoryInsee(selectors, TerritoryCodeEnum.City, e));
      }
      if (p.end.com) {
        p.end.com = p.end.com.map((e) => this.findTerritoryInsee(selectors, TerritoryCodeEnum.City, e));
      }
      return p;
    });
  }

  private findTerritoryInsee(selectors: ResultInterface, selectorType: TerritoryCodeEnum, insee: string) {
    const territory = selectors.find((s) => s.type === selectorType && s.insee === insee);
    return {
      insee: territory.insee,
      name: territory.name,
    };
  }

  private concatStartEndInsee(starts: string[], ends: string[]): string[] {
    let arr: string[] = [];
    if (starts) {
      arr = arr.concat(starts);
    }
    if (ends) {
      arr = arr.concat(ends);
    }
    return arr;
  }
}
