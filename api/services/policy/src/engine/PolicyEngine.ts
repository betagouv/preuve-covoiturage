import { provider } from '@ilos/common';
import { CampaignInterface, TripInterface } from '@pdc/provider-schema';

import { CampaignMetadataRepositoryProviderInterfaceResolver } from '../interfaces/CampaignMetadataRepositoryProviderInterface';
import { CampaignRepositoryProviderInterfaceResolver } from '../interfaces/CampaignRepositoryProviderInterface';
import { ApplicableRuleInterface } from '../interfaces/RuleInterfaces';

import { policies } from './rules';
import { compose } from './helpers/compose';

@provider()
export class PolicyEngine {
  constructor(
    protected campaignRepository: CampaignRepositoryProviderInterfaceResolver,
    protected metaRepository: CampaignMetadataRepositoryProviderInterfaceResolver,
  ) {}

  protected async compose(campaign: CampaignInterface) {
    const rules = this.getOrderedApplicableRules(campaign).map((rule) => rule.apply(rule.parameters));

    return compose(rules);
  }

  public async process(trip: TripInterface) {
    const campaigns = await this.campaignRepository.findApplicableCampaigns(trip);
    for (const campaign of campaigns) {
      const apply = await this.compose(campaign);
      const meta = await this.metaRepository.get(campaign._id);
      for (const person of trip.people) {
        const ctx = { trip, person, meta, result: 1 };
        await apply(ctx);
        // do something with result :)
      }
      await this.metaRepository.set(meta);
    }
  }

  protected getOrderedApplicableRules(campaign: CampaignInterface): ApplicableRuleInterface[] {
    const rules = [...campaign.global_rules, ...campaign.rules];
    return rules
      .map((rule) => policies.find((p) => p.slug === rule.slug))
      .sort((rule1, rule2) => (rule1.index < rule2.index ? -1 : rule1.index < rule2.index ? 1 : 0));
  }
}
