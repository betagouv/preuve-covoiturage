import {
  RuleInterface,
  RuleHandlerParamsInterface,
  RuleHandlerContextInterface,
} from './interfaces';
import { NotApplicableTargetException } from './exceptions/NotApplicableTargetException';
import { RuleSet } from './RuleSet';
import { StatefulRuleSet } from './StatefulRuleSet';
import { IncentiveInterface, CampaignInterface } from '../interfaces';

export class ProcessableCampaign {
  protected globalSet: RuleSet;
  protected globalStatefulSet: StatefulRuleSet;
  protected ruleSets: RuleSet[];
  protected statefulRuleSets: StatefulRuleSet[];

  constructor(protected campaign: CampaignInterface) {
    this.globalSet = new RuleSet(campaign.global_rules);
    // this.globalStatefulSet = new StatefulRuleSet(globalRules);
    this.ruleSets = campaign.rules.map((set) => new RuleSet(set));
    // this.statefulRuleSets = rules.map((set) => new StatefulRuleSet(set));
  }

  apply(context: RuleHandlerContextInterface): IncentiveInterface {
    let result = 0;
    try {
      let ctx = context;
      this.globalSet.filter(ctx);
      ctx = this.globalSet.transform(ctx);

      for (const ruleSet of this.ruleSets) {
        const currentContext = { ...ctx, result: 0 };
        try {
          ruleSet.apply(currentContext);
        } catch (e) {
          if (!(e instanceof NotApplicableTargetException)) {
            throw e;
          }
          context.stack.push(e.message);
        }
        result += currentContext.result;
      }

      context.stack.push(`result: ${result}`);
      result = this.globalSet.modify(ctx, result);
      this.globalSet.nativeApply({ ...ctx, result });
    } catch (e) {
      if (!(e instanceof NotApplicableTargetException)) {
        throw e;
      }
      context.stack.push(e.message);
      result = 0;
    }

    return {
      policy_id: this.campaign._id,
      carpool_id: context.person.carpool_id,
      amount: Math.round(result),
      result: Math.round(result),
      datetime: context.person.datetime,
      status: 'draft',
      state: 'regular',
      meta: {
        // TODO
      }
      // status
      // detail:
    } as any;
  }
}
