import {
  IncentiveInterface
} from '../interfaces';
import {
  RuleInterface,
  StaticRuleInterface,
  RuleHandlerContextInterface,
  StatefulRuleInterface,
  MetaInterface,
} from './interfaces';
import { STATEFUL } from './helpers/type';
import { AbstractRuleSet } from './AbstractRuleSet';
import { FakeMetadataWrapper } from './meta/MetadataWrapper';
import { NotApplicableTargetException } from './exceptions/NotApplicableTargetException';

export class StatefulRuleSet extends AbstractRuleSet {
  protected statefulSet: StatefulRuleInterface[];

  constructor(ruleDefinitions: RuleInterface[]) {
    super();
    this.sort(this.resolve(ruleDefinitions));
  }

  protected sort(rules: { ctor: StaticRuleInterface; def: RuleInterface }[]): void {
    this.statefulSet = rules
    .filter(({ ctor }) => ctor.type === STATEFUL)
    .map((r) => this.instanciate<StatefulRuleInterface>(r.ctor, r.def));
  }

  buildInitialState(context: RuleHandlerContextInterface): {
    incentive: Map<string, string>;
    policy: Map<string, number>;
  } {
    const incentiveState: Map<string, string> = new Map();
    const policyState: Map<string, number> = new Map();

    for (const statefulRule of this.statefulSet) {
      const fakeMeta = new FakeMetadataWrapper();
      statefulRule.getState(context, fakeMeta);
      const ruleStateKeys = fakeMeta.keys();
      if (ruleStateKeys.length > 1) {
        throw new Error('Initial state should only have one meta key');
      }
      incentiveState.set(statefulRule.uuid, ruleStateKeys[0]);
      for(const key of ruleStateKeys) {
        policyState.set(key, fakeMeta.get(key));
      }
    }

    return {
      incentive: incentiveState,
      policy: policyState,
    };
  }

  listStateKeys(incentive: IncentiveInterface): string[] {
    const keys = new Set<string>(this.statefulSet
      .map(s => s.uuid)
      .map(k => incentive.meta[k])
    );
    return [...keys];
  }

  apply(incentive: IncentiveInterface, meta: MetaInterface): number {
    let result = incentive.result;
    for (const statefulRule of this.statefulSet) {
      if (statefulRule.uuid in incentive.meta) {
        if (!meta.has(incentive.meta[statefulRule.uuid])) {
          throw new Error('Unable to build state, missing key');
        }
        const state = meta.get(incentive.meta[statefulRule.uuid]);
        try {
          result = statefulRule.apply(incentive.result, state);
          meta.set(statefulRule.uuid, statefulRule.setState(result, state));
        } catch(e) {
          if (!(e instanceof NotApplicableTargetException)) {
            throw e;
          }
          result = 0;
          meta.set(statefulRule.uuid, statefulRule.setState(result, state));
        }
      }
    }

    return result;
  }
}