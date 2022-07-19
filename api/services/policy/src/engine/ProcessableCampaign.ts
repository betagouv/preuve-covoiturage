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
import { TerritorySelectorsInterface } from '../shared/territory/common/interfaces/TerritoryCodeInterface';

export class ProcessableCampaign {
  public readonly policy_id: number;
  public readonly start_date: Date;
  public readonly end_date: Date;
  public readonly territory_id: number;
  public readonly territory_selector: TerritorySelectorsInterface;

  protected rules: RuleSet;

  constructor(protected campaign: CampaignInterface, selectors: TerritorySelectorsInterface = {}) {
    this.policy_id = campaign._id;
    this.start_date = campaign.start_date;
    this.end_date = campaign.end_date;
    this.territory_id = campaign.territory_id;
    this.territory_selector = selectors;
  }

  getMetaKeys(incentive: IncentiveInterface): string[] {
    return this.rules.listStateKeys(incentive);
  }

  getMetaExtra(incentive: IncentiveInterface): { [k: string]: number } {
    return (incentive.meta._extra as Record<string, number>) || {};
  }

  needStatefulApply(): boolean {
    return [this.rules].map((s) => s.hasStatefulRule).reduce((r, s) => r || s, false);
  }

  applyStateful(incentive: IncentiveInterface, meta: MetadataWrapperInterface): IncentiveInterface {
    const amount = this.rules.applyStateful(incentive, meta);
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
      this.rules.apply(ctx, meta);
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
