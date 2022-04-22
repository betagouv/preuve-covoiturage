import { RuleHandlerContextInterface } from './interfaces';
import { NotApplicableTargetException } from './exceptions/NotApplicableTargetException';
import { RuleSet } from './RuleSet';
import {
  IncentiveStatusEnum,
  IncentiveStateEnum,
  IncentiveInterface,
  CampaignInterface,
  MetadataWrapperInterface,
} from '../interfaces';
import { MetadataWrapper } from '../providers/MetadataWrapper';
import { TerritoryCodesInterface } from '../../../../../shared/territory/common/interfaces/TerritoryCodeInterface';

export class ProcessableCampaign {
  public readonly policy_id: number;
  public readonly start_date: Date;
  public readonly end_date: Date;
  public readonly territory_id: number;
  public readonly territory_selector: TerritoryCodesInterface;

  protected globalSet: RuleSet;
  protected ruleSets: RuleSet[];

  constructor(protected campaign: CampaignInterface) {
    this.policy_id = campaign._id;
    this.start_date = campaign.start_date;
    this.end_date = campaign.end_date;
    this.territory_id = campaign.territory_id;
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

  getMetaExtra(incentive: IncentiveInterface): { [k: string]: number } {
    return (incentive.meta._extra as Record<string, number>) || {};
  }

  needStatefulApply(): boolean {
    return [this.globalSet, ...this.ruleSets].map((s) => s.hasStatefulRule).reduce((r, s) => r || s, false);
  }

  applyStateful(incentive: IncentiveInterface, meta: MetadataWrapperInterface): IncentiveInterface {
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

  apply(
    context: RuleHandlerContextInterface,
    meta: MetadataWrapperInterface = new MetadataWrapper(),
  ): IncentiveInterface {
    let result = 0;

    try {
      const ctx = { ...context, result };
      this.globalSet.apply(ctx, meta);

      for (const ruleSet of this.ruleSets) {
        const currentContext = { ...ctx, result: 0 };
        try {
          ruleSet.apply(currentContext, meta);
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

    return {
      meta: meta.export(),
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
