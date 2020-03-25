import { MetaInterface, RuleHandlerContextInterface } from './interfaces';
import { NotApplicableTargetException } from './exceptions/NotApplicableTargetException';
import { RuleSet } from './RuleSet';
import { StatefulRuleSet } from './set/StatefulRuleSet';
import { IncentiveStatusEnum, IncentiveStateEnum, IncentiveInterface, CampaignInterface } from '../interfaces';

export class ProcessableCampaign {
  public readonly policy_id: number;
  protected globalSet: RuleSet;
  protected globalStatefulSet: StatefulRuleSet;
  protected ruleSets: RuleSet[];
  protected statefulRuleSets: StatefulRuleSet[];

  constructor(protected campaign: CampaignInterface) {
    this.policy_id = campaign._id;
    this.globalSet = new RuleSet(campaign.global_rules);
    this.ruleSets = campaign.rules.map((set) => new RuleSet(set));
  }

  getMetaKeys(incentive: IncentiveInterface): string[] {
    return [
      ...new Set<string>(
        [this.globalSet, ...this.ruleSets]
          .map((r) => r.listStateKeys(incentive))
          .reduce((arr, curr) => [...arr, ...curr], []),
      ),
    ];
  }

  needStatefulApply(): boolean {
    return [this.globalSet, ...this.ruleSets].map((s) => s.hasStatefulRule).reduce((r, s) => r || s, false);
  }

  applyStateful(incentive: IncentiveInterface, meta: MetaInterface): IncentiveInterface {
    let amount = this.globalSet.applyStateful(incentive, meta);
    for (const ruleSet of this.ruleSets) {
      amount = ruleSet.applyStateful(
        {
          ...incentive,
          result: amount,
        },
        meta,
      );
    }
    return {
      ...incentive,
      amount,
    };
  }

  apply(context: RuleHandlerContextInterface): IncentiveInterface {
    let result = 0;

    let incentiveState: Map<string, string> = new Map();

    try {
      const ctx = { ...context, result };
      incentiveState = this.globalSet.apply(ctx);

      for (const ruleSet of this.ruleSets) {
        const currentContext = { ...ctx, result: 0 };
        try {
          incentiveState = new Map([...incentiveState, ...ruleSet.apply(currentContext)]);
        } catch (e) {
          if (!(e instanceof NotApplicableTargetException)) {
            throw e;
          }
          context.stack.push(e.message);
        }
        result += currentContext.result;
      }

      context.stack.push(`result: ${result}`);
    } catch (e) {
      if (!(e instanceof NotApplicableTargetException)) {
        throw e;
      }
      context.stack.push(e.message);
      result = 0;
    }

    const meta = [...incentiveState].reduce((obj, [k, v]) => {
      obj[k] = v;
      return obj;
    }, {});

    return {
      meta,
      carpool_id: context.person.carpool_id,
      policy_id: this.campaign._id,
      datetime: context.person.datetime,
      result: Math.round(result),
      amount: Math.round(result),
      state: IncentiveStateEnum.Regular,
      status: IncentiveStatusEnum.Draft,
    };
  }
}
