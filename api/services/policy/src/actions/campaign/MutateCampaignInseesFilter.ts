import { ExportAction } from './../../../../trip/src/actions/ExportAction';
import { KernelInterfaceResolver, provider } from '@ilos/common';

import { RuleInterface } from '../../engine/interfaces';
import { TerritoryParamsInterface } from '../../engine/rules/filters/TerritoryFilter';
import { TerritoryFilterRuleDecorated } from '../../interfaces/TerritoryFilterRuleDecorated';
import { TerritoryCodeEnum } from '../../shared/territory/common/interfaces/TerritoryCodeInterface';
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
      const territorySelectorsInterface: TerritoryParamsInterface[] = inseeBlacklistFilterRules.parameters;
      const params: ParamsInterface = {
        epci: territorySelectorsInterface.flatMap((s) => this.concatStartEndInsee(s.start?.epci, s.end?.epci)),
        aom: territorySelectorsInterface.flatMap((s) => this.concatStartEndInsee(s.start?.aom, s.end?.aom)),
        com: territorySelectorsInterface.flatMap((s) => this.concatStartEndInsee(s.start?.com, s.end?.com)),
      };
      const selectors: ResultInterface = await this.kernel.call<ParamsInterface, ResultInterface>(signature, params, {
        channel: { service: handlerConfig.service },
      });

      inseeBlacklistFilterRules.parameters = inseeBlacklistFilterRules.parameters.map((p) => {
        if (p.start.epci) {
          p.start.epci = p.start.epci.map((e) => this.findTerritoryInsee(selectors, 'epci', e));
        }
        if (p.end.epci) {
          p.end.epci = p.end.epci.map((e) => this.findTerritoryInsee(selectors, 'epci', e));
        }
        if (p.start.aom) {
          p.start.aom = p.start.aom.map((e) => this.findTerritoryInsee(selectors, 'aom', e));
        }
        if (p.end.aom) {
          p.end.aom = p.end.aom.map((e) => this.findTerritoryInsee(selectors, 'aom', e));
        }
        if (p.start.com) {
          p.start.com = p.start.com.map((e) => this.findTerritoryInsee(selectors, 'com', e));
        }
        if (p.end.com) {
          p.end.com = p.end.com.map((e) => this.findTerritoryInsee(selectors, 'com', e));
        }
        return p;
      });
    }

    if (inseeWhitelistFilterRules && inseeWhitelistFilterRules.parameters) {
      const territorySelectorsInterface: TerritoryParamsInterface[] = inseeWhitelistFilterRules.parameters;
      const params: ParamsInterface = {
        epci: territorySelectorsInterface.flatMap((s) => this.concatStartEndInsee(s.start?.epci, s.end?.epci)),
        aom: territorySelectorsInterface.flatMap((s) => this.concatStartEndInsee(s.start?.aom, s.end?.aom)),
        com: territorySelectorsInterface.flatMap((s) => this.concatStartEndInsee(s.start?.com, s.end?.com)),
      };
      const selectors: ResultInterface = await this.kernel.call<ParamsInterface, ResultInterface>(signature, params, {
        channel: { service: handlerConfig.service },
      });

      inseeWhitelistFilterRules.parameters = inseeWhitelistFilterRules.parameters.map((p) => {
        if (p.start.epci) {
          p.start.epci = p.start.epci.map((e) => this.findTerritoryInsee(selectors, 'epci', e));
        }
        if (p.end.epci) {
          p.end.epci = p.end.epci.map((e) => this.findTerritoryInsee(selectors, 'epci', e));
        }
        if (p.start.aom) {
          p.start.aom = p.start.aom.map((e) => this.findTerritoryInsee(selectors, 'aom', e));
        }
        if (p.end.aom) {
          p.end.aom = p.end.aom.map((e) => this.findTerritoryInsee(selectors, 'aom', e));
        }
        if (p.start.com) {
          p.start.com = p.start.com.map((e) => this.findTerritoryInsee(selectors, 'com', e));
        }
        if (p.end.com) {
          p.end.com = p.end.com.map((e) => this.findTerritoryInsee(selectors, 'com', e));
        }
        return p;
      });
    }
    return mutatedGlobalRules;
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
