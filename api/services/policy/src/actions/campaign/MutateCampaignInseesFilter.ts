import { provider } from '@ilos/common';

import { RuleInterface } from '../../engine/interfaces';

@provider()
export class MutateCampaignInseesFilter {
  async call(global_rules: RuleInterface[]): Promise<RuleInterface[]> {
    const inseeBlacklistFilterRules = global_rules.find((r) => r.slug === 'territory_blacklist_filter');
    if (inseeBlacklistFilterRules) {
      
    }
    return global_rules;
  }
}
