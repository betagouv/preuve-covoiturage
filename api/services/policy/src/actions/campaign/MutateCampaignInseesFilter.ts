import { KernelInterfaceResolver, provider } from '@ilos/common';

import { RuleInterface } from '../../engine/interfaces';
import { TerritoryFilterRuleDecorated } from '../../interfaces/TerritoryFilterRuleDecorated';
import {
  TerritoryCodeEnum,
  TerritorySelectorsInterface,
} from '../../shared/territory/common/interfaces/TerritoryCodeInterface';
import {
  handlerConfig,
  ResultInterface,
  signature,
  ParamsInterface,
} from '../../shared/territory/findGeoByCode.contract';

@provider()
export class MutateCampaignInseesFilter {
  constructor(private readonly kernel: KernelInterfaceResolver) {}
  async call(global_rules: RuleInterface[]): Promise<RuleInterface[]> {
    const inseeBlacklistFilterRules: RuleInterface = global_rules.find((r) => r.slug === 'territory_blacklist_filter');
    if (inseeBlacklistFilterRules) {
      const territorySelectorsInterface: TerritorySelectorsInterface = inseeBlacklistFilterRules.parameters;
      const selectors: ResultInterface = await this.kernel.call<ParamsInterface, ResultInterface>(
        signature,
        territorySelectorsInterface,
        {
          channel: { service: handlerConfig.service },
          call: { user: { permissions: ['registry.trip.excelExport'] } },
        },
      );
      const territoryFilter: TerritoryFilterRuleDecorated = {
        aom: selectors.filter((s) => s.type === TerritoryCodeEnum.Mobility),
        epci: selectors.filter((s) => s.type === TerritoryCodeEnum.CityGroup),
        com: selectors.filter((s) => s.type === TerritoryCodeEnum.City),
      };
      global_rules.map((r) => (r.slug === 'territory_blacklist_filter' ? (r.parameters = territoryFilter && r) : r));
    }
    return global_rules;
  }
}
