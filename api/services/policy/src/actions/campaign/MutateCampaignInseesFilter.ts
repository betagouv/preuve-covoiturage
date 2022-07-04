import { KernelInterfaceResolver, provider } from '@ilos/common';

import { RuleInterface } from '../../engine/interfaces';
import { TerritoryParamsInterface } from '../../engine/rules/filters/TerritoryFilter';
import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
  signature,
} from '../../shared/territory/findGeoByCode.contract';

@provider()
export class MutateCampaignInseesFilter {
  constructor(private readonly kernel: KernelInterfaceResolver) {}
  async call(global_rules: RuleInterface[]): Promise<RuleInterface[]> {
    const mutatedGlobalRules: RuleInterface[] = global_rules;

    const inseeBlacklistFilterRules: RuleInterface = mutatedGlobalRules.find(
      (r) => r.slug === 'territory_blacklist_filter',
    );
    const inseeWhitelistFilterRules: RuleInterface = mutatedGlobalRules.find(
      (r) => r.slug === 'territory_whitelist_filter',
    );

    if (!inseeBlacklistFilterRules && !inseeWhitelistFilterRules) {
      return global_rules;
    }
    if (inseeBlacklistFilterRules && inseeBlacklistFilterRules.parameters) {
      inseeBlacklistFilterRules.parameters = await this.territoryFiltersWithName(inseeBlacklistFilterRules);
    }
    if (inseeWhitelistFilterRules && inseeWhitelistFilterRules.parameters) {
      inseeWhitelistFilterRules.parameters = await this.territoryFiltersWithName(inseeWhitelistFilterRules);
    }
    return mutatedGlobalRules;
  }

  private async territoryFiltersWithName(territoryFilterRules: RuleInterface) {
    const territorySelectorsInterface: TerritoryParamsInterface[] = territoryFilterRules.parameters;
    const params: ParamsInterface = {
      epci: territorySelectorsInterface.flatMap((s) => this.concatStartEndInsee(s.start?.epci, s.end?.epci)),
      aom: territorySelectorsInterface.flatMap((s) => this.concatStartEndInsee(s.start?.aom, s.end?.aom)),
      com: territorySelectorsInterface.flatMap((s) => this.concatStartEndInsee(s.start?.com, s.end?.com)),
    };

    const selectors: ResultInterface = await this.kernel.call<ParamsInterface, ResultInterface>(signature, params, {
      channel: { service: handlerConfig.service },
    });

    return territoryFilterRules.parameters.map((parameter) => {
      if (parameter.start.epci) {
        parameter.start.epci = parameter.start.epci.map((e) => this.findTerritoryInsee(selectors, 'epci', e));
      }
      if (parameter.end.epci) {
        parameter.end.epci = parameter.end.epci.map((e) => this.findTerritoryInsee(selectors, 'epci', e));
      }
      if (parameter.start.aom) {
        parameter.start.aom = parameter.start.aom.map((e) => this.findTerritoryInsee(selectors, 'aom', e));
      }
      if (parameter.end.aom) {
        parameter.end.aom = parameter.end.aom.map((e) => this.findTerritoryInsee(selectors, 'aom', e));
      }
      if (parameter.start.com) {
        parameter.start.com = parameter.start.com.map((e) => this.findTerritoryInsee(selectors, 'com', e));
      }
      if (parameter.end.com) {
        parameter.end.com = parameter.end.com.map((e) => this.findTerritoryInsee(selectors, 'com', e));
      }
      return parameter;
    });
  }

  private findTerritoryInsee(selectors: ResultInterface, selectorType: string, insee: string) {
    const territory = selectors.find((s) => s.type === selectorType && s.insee === insee);
    return {
      insee: territory.insee,
      name: territory.name,
    };
  }

  private concatStartEndInsee(starts: string[], ends: string[]): string[] {
    const arr: string[] = [];
    if (starts) {
      arr.concat(starts);
    }
    if (ends) {
      arr.concat(ends);
    }
    return arr;
  }
}
