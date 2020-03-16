import {
  IncentiveInterface
} from '../interfaces';
import {
  RuleInterface,
  StaticRuleInterface,
  RuleHandlerContextInterface,
  StatefulRuleInterface,
  ResultInterface,
  MetaInterface,
} from './interfaces';
import { STATEFUL } from './helpers/type';
import { AbstractRuleSet } from './AbstractRuleSet';
import { FakeMetadataWrapper } from './meta/MetadataWrapper';

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

  async buildInitialState(context: RuleHandlerContextInterface): Promise<{
    incentive: Map<string, string[]>;
    policy: Map<string, number>;
  }> {
    const incentiveState: Map<string, string[]> = new Map();
    const policyState: Map<string, number> = new Map();

    for (const statefulRule of this.statefulSet) {
      const fakeMeta = new FakeMetadataWrapper();
      await statefulRule.getState(context, fakeMeta);
      const ruleStateKeys = fakeMeta.keys();
      incentiveState.set(statefulRule.uuid, ruleStateKeys);
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
      .reduce((arr, i) => [...arr, ...i], [])
    );
    return [...keys];
  }

  apply(incentive: IncentiveInterface, meta: MetaInterface): ResultInterface {
    let result = {
      result: incentive.result,
      amount: incentive.result,
    };
    for (const statefulRule of this.statefulSet) {
      const state = meta.get(statefulRule.uuid);
      result = statefulRule.apply(result, state);
      meta.set(statefulRule.uuid, statefulRule.setState(result, state));
    }
    return result;
  }
}