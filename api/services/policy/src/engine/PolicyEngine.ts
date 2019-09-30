import { provider } from '@ilos/common';
import { CampaignInterface, TripInterface } from '@pdc/provider-schema';

import { CampaignMetadataRepositoryProviderInterfaceResolver } from '../interfaces/CampaignMetadataRepositoryProviderInterface';
import { CampaignRepositoryProviderInterfaceResolver } from '../interfaces/CampaignRepositoryProviderInterface';
import { ApplicableRuleInterface } from '../interfaces/RuleInterfaces';

import { policies } from './rules';
import { compose } from './helpers/compose';
import { NotApplicableTargetException } from '../exceptions/NotApplicableTargetException';

@provider()
export class PolicyEngine {
  constructor(
    protected campaignRepository: CampaignRepositoryProviderInterfaceResolver,
    protected metaRepository: CampaignMetadataRepositoryProviderInterfaceResolver,
  ) {}

  protected compose(campaign: CampaignInterface) {
    const rules = this.getOrderedApplicableRules(campaign);

    return compose(rules.map((rule) => rule.apply(rule.parameters)));
  }

  public async process(trip: TripInterface) {
    const campaigns = await this.campaignRepository.findApplicableCampaigns(trip);
    const results = [];
    for (const campaign of campaigns) {
      // build function
      const apply = this.compose(campaign);
      // get metadata wrapper
      const meta = await this.metaRepository.get(campaign._id);

      for (const person of trip.people) {
        const ctx = { trip, person, meta, result: 1 };
        try {
          await apply(ctx, async () => {});
          results.push({
            campaign: campaign._id,
            trip: trip._id,
            person: person.identity.phone,
            amount: ctx.result,
          });
        } catch (e) {
          if (!(e instanceof NotApplicableTargetException)) {
            throw e;
          }
        }
        // do something with result :)
      }

      // save metadata
      await this.metaRepository.set(meta);
    }
    return results;
  }

  protected getOrderedApplicableRules(campaign: CampaignInterface): ApplicableRuleInterface[] {
    const rules = [...campaign.global_rules, ...campaign.rules];
    return rules
      .map((rule) => ({
        ...rule,
        ...policies.find((p) => p.slug === rule.slug),
      }))
      .filter((rule) => rule !== undefined && 'apply' in rule)
      .sort((rule1, rule2) => (rule1.index < rule2.index ? -1 : rule1.index < rule2.index ? 1 : 0));
  }
}
