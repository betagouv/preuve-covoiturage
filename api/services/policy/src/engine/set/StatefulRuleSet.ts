import { IncentiveInterface } from '../../interfaces';
import {
  RuleHandlerContextInterface,
  StatefulRuleInterface,
  MetaInterface,
  StatefulRuleSetInterface,
  StaticRuleInterface,
} from '../interfaces';
import { type, STATEFUL } from '../helpers/type';
import { FakeMetadataWrapper } from '../meta/MetadataWrapper';
import { NotApplicableTargetException } from '../exceptions/NotApplicableTargetException';
import { AbstractRuleSet } from './AbstractRuleSet';

export class StatefulRuleSet extends AbstractRuleSet<StatefulRuleInterface> implements StatefulRuleSetInterface {
  readonly type: type = STATEFUL;

  constructor(rules: { ctor: StaticRuleInterface; params?: any }[]) {
    super();
    this.getRules(this.type, rules);
  }

  buildInitialState(context: RuleHandlerContextInterface): Map<string, string> {
    const incentiveState: Map<string, string> = new Map();

    for (const statefulRule of this.ruleSet) {
      const fakeMeta = new FakeMetadataWrapper();
      statefulRule.getState(context, fakeMeta);
      const ruleStateKeys = fakeMeta.keys();
      if (ruleStateKeys.length > 1) {
        throw new Error('Initial state should only have one meta key');
      }
      if (ruleStateKeys.length === 1) {
        incentiveState.set(statefulRule.uuid, ruleStateKeys[0]);
      }
    }

    return incentiveState;
  }

  listStateKeys(incentive: IncentiveInterface): string[] {
    const keys = new Set<string>(this.ruleSet.map((s) => s.uuid).map((k) => incentive.meta[k]));
    return [...keys];
  }

  apply(incentive: IncentiveInterface, meta: MetaInterface): number {
    let result = incentive.result;
    for (const statefulRule of this.ruleSet) {
      if (statefulRule.uuid in incentive.meta) {
        const metaKey = incentive.meta[statefulRule.uuid];
        const state = meta.get(metaKey);
        try {
          result = statefulRule.apply(incentive.result, state);
          meta.set(metaKey, statefulRule.setState(result, state));
        } catch (e) {
          if (!(e instanceof NotApplicableTargetException)) {
            throw e;
          }
          result = 0;
          meta.set(metaKey, statefulRule.setState(result, state));
        }
      }
    }

    return result;
  }
}
