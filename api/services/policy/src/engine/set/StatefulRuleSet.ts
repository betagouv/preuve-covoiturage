import { IncentiveInterface, MetadataWrapperInterface } from '../../interfaces';
import {
  RuleHandlerContextInterface,
  StatefulRuleInterface,
  StatefulRuleSetInterface,
  StaticRuleInterface,
} from '../interfaces';
import { type, STATEFUL } from '../helpers/type';
import { NotApplicableTargetException } from '../exceptions/NotApplicableTargetException';
import { AbstractRuleSet } from './AbstractRuleSet';

export class StatefulRuleSet extends AbstractRuleSet<StatefulRuleInterface> implements StatefulRuleSetInterface {
  readonly type: type = STATEFUL;

  constructor(rules: { ctor: StaticRuleInterface; params?: any }[]) {
    super();
    this.getRules(this.type, rules);
  }

  get length(): number {
    return this.ruleSet.length;
  }

  buildInitialState(context: RuleHandlerContextInterface, meta: MetadataWrapperInterface): void {
    for (const statefulRule of this.ruleSet) {
      statefulRule.initState(context, meta);
    }
  }

  listStateKeys(incentive: IncentiveInterface): string[] {
    const keys = new Set<string>(this.ruleSet.map((s) => s.uuid).map((k) => incentive.meta[k]));
    return [...keys];
  }

  apply(incentive: IncentiveInterface, meta: MetadataWrapperInterface): number {
    let result = incentive.result;
    for (const statefulRule of this.ruleSet) {
      if (statefulRule.uuid in incentive.meta) {
        const metaKey = incentive.meta[statefulRule.uuid];
        const state = meta.get(metaKey);
        try {
          result = statefulRule.apply(result, state, meta);
          meta.set(metaKey, statefulRule.getNewState(result, state, meta));
        } catch (e) {
          if (!(e instanceof NotApplicableTargetException)) {
            throw e;
          }
          result = 0;
          meta.set(metaKey, statefulRule.getNewState(result, state, meta));
        }
      }
    }

    return result;
  }
}
