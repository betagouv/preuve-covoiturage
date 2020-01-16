import { provider } from '@ilos/common';

import {
  CampaignInterface,
  CampaignMetadataRepositoryProviderInterfaceResolver,
  IncentiveInterface,
  TripInterface,
} from '../interfaces';
// import { compose } from './helpers/compose';

import { Campaign } from './ProcessableCampaign';
import { NotApplicableTargetException } from './exceptions/NotApplicableTargetException';

@provider()
export class PolicyEngine {
  constructor(protected metaRepository: CampaignMetadataRepositoryProviderInterfaceResolver) {}

  // protected compose(campaign: CampaignInterface): Function {
  //   const rules = this.getOrderedApplicableRules(campaign).map(compose);
  //   return async (ctx): Promise<boolean> => {
  //     // for each rule set of rules
  //     for (const rule of rules) {
  //       try {
  //         await rule(ctx);
  //         // if rule not throwing something, stop
  //         return true;
  //       } catch (e) {
  //         // if rule is throwing a NotAplicableTargetException, process next
  //         if (!(e instanceof NotApplicableTargetException)) {
  //           throw e;
  //         }
  //       }
  //     }
  //     // no rule set is applicable here, do nothing
  //     return false;
  //   };
  // }

  public async process(trip: TripInterface, campaign: CampaignInterface): Promise<IncentiveInterface[]> {
    const results: IncentiveInterface[] = [];
    if (
      trip.territories.indexOf(campaign.territory_id) < 0 ||
      trip.datetime > campaign.end_date ||
      trip.datetime < campaign.start_date
    ) {
      return results;
    }

    const pc = new Campaign(campaign.global_rules, campaign.rules);

    // get metadata wrapper
    const meta = await this.metaRepository.get(campaign._id);

    for (const person of trip.people) {
      const ctx = { trip, person, meta, result: undefined };
      try {
        await pc.apply(ctx);
        results.push({
          policy_id: campaign._id,
          carpool_id: person.carpool_id,
          identity_uuid: person.identity_uuid,
          amount: Math.round(ctx.result),
          // status
          // detail
        });
      } catch(e) {
        console.log(e.name, e.message);
        if (!(e instanceof NotApplicableTargetException)) {
          throw e;
        }
      }
    }

    await this.metaRepository.set(meta);
    return results;
  }

  // protected getOrderedApplicableRules(campaign: CampaignInterface): RuleHandlerInterface[][] {
  //   const results = [];
  //   for (const ruleSet of campaign.rules) {
  //     // merge current rule set with global rule set
  //     const rules = [...campaign.global_rules, ...ruleSet];
  //     results.push(
  //       rules
  //         // merge the configuration object with the applicable rule
  //         .map((rule) => ({
  //           ...rule,
  //           ...availableRules.find((p) => p.slug === rule.slug),
  //         }))
  //         // filter if some rule not implement apply method
  //         .filter((rule) => rule !== undefined && 'apply' in rule)
  //         // sort it by index
  //         .sort((rule1, rule2) => (rule1.index < rule2.index ? -1 : rule1.index < rule2.index ? 1 : 0))
  //         // build the apply function by passing params
  //         .map((rule) => rule.apply(rule.parameters)),
  //     );
  //   }
  //   return results;
  // }
}
