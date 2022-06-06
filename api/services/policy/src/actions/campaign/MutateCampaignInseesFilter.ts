import { provider } from '@ilos/common';

import { RuleInterface } from '../../engine/interfaces';

@provider()
export class MutateCampaignInseesFilter {
  async call(global_rules: RuleInterface[]): Promise<RuleInterface[]> {
    throw new Error('Method not implemented.');

    const inseeBlacklistFilterRules = campaign.global_rules.find((r) => r.slug === 'insee_blacklist_filter');
    if (inseeBlacklistFilterRules) {
    }
  }
}
