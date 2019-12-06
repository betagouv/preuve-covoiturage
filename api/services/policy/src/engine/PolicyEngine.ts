import { provider } from '@ilos/common';

import { CampaignInterface } from '../interfaces/CampaignInterface';
import { TripInterface } from '../interfaces/TripInterface';
import { CampaignMetadataRepositoryProviderInterfaceResolver } from '../interfaces/CampaignMetadataRepositoryProviderInterface';
import { CampaignRepositoryProviderInterfaceResolver } from '../interfaces/CampaignRepositoryProviderInterface';
import { RuleHandlerInterface } from '../interfaces/RuleHandlerInterface';
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
    const rules = this.getOrderedApplicableRules(campaign).map(compose);
    return async (ctx) => {
      // for each rule set of rules
      for (const rule of rules) {
        try {
          await rule(ctx);
          // if rule not throwing something, stop
          return true;
        } catch (e) {
          // if rule is throwing a NotAplicableTargetException, process next
          if (!(e instanceof NotApplicableTargetException)) {
            throw e;
          }
        }
      }
      // no rule set is applicable here, do nothing
      return false;
    };
  }

  public async process(trip: TripInterface) {
    const campaigns = await this.campaignRepository.findApplicableCampaigns(trip.territories, trip.datetime);
    const results = [];
    for (const campaign of campaigns) {
      // build function
      const apply = this.compose(campaign);
      // get metadata wrapper
      const meta = await this.metaRepository.get(campaign._id);

      for (const person of trip.people) {
        const ctx = { trip, person, meta, result: 1 };
        const result = await apply(ctx);
        if (result) {
          // do something with result :)
          results.push({
            campaign: campaign._id,
            trip: 1, // trip_id
            person: person.identity_uuid,
            amount: ctx.result,
          });
        }
      }

      // save metadata
      await this.metaRepository.set(meta);
    }
    return results;
  }

  protected getOrderedApplicableRules(campaign: CampaignInterface): RuleHandlerInterface[][] {
    const results = [];
    for (const ruleSet of campaign.rules) {
      // merge current rule set with global rule set
      const rules = [...campaign.global_rules, ...ruleSet];
      results.push(
        rules
          // merge the configuration object with the applicable rule
          .map((rule) => ({
            ...rule,
            ...policies.find((p) => p.slug === rule.slug),
          }))
          // filter if some rule not implement apply method
          .filter((rule) => rule !== undefined && 'apply' in rule)
          // sort it by index
          .sort((rule1, rule2) => (rule1.index < rule2.index ? -1 : rule1.index < rule2.index ? 1 : 0))
          // build the apply function by passing params
          .map((rule) => rule.apply(rule.parameters)),
      );
    }
    return results;
  }
}
