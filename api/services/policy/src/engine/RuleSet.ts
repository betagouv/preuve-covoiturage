import * as RS from './set';
import { rules as availableRules } from './rules';

import {
  RuleInterface,
  FilterRuleInterface,
  SetterRuleInterface,
  ModifierRuleInterface,
  TransformerRuleInterface,
  RuleHandlerParamsInterface,
  AppliableRuleInterface,
  StatefulRuleSetInterface,
  MetaInterface,
  StaticRuleInterface,
  MetaRuleInterface,
} from './interfaces';
import { IncentiveInterface } from '../interfaces';
import { UnprocessableRuleSetException } from './exceptions/UnprocessableRuleSetException';
import { META } from './helpers/type';

export class RuleSet {
  protected availableRules: StaticRuleInterface[] = availableRules;

  protected filterSet: FilterRuleInterface;
  protected transformerSet: TransformerRuleInterface;
  protected setterSet: SetterRuleInterface;
  protected modifierSet: ModifierRuleInterface;
  protected nativeSet: AppliableRuleInterface;
  protected statefulSet: StatefulRuleSetInterface;

  constructor(ruleDefinitions: RuleInterface[]) {
    const rules = this.resolve(ruleDefinitions);
    this.filterSet = new RS.FilterRuleSet(rules);
    this.transformerSet = new RS.TransformerRuleSet(rules);
    this.setterSet = new RS.SetterRuleSet(rules);
    this.modifierSet = new RS.ModifierRuleSet(rules);
    this.nativeSet = new RS.NativeRuleSet(rules);
    this.statefulSet = new RS.StatefulRuleSet(rules);
  }

  get hasStatefulRule(): boolean {
    return this.statefulSet.length > 0;
  }

  protected resolve(ruleDefinitions: RuleInterface[]): { ctor: StaticRuleInterface; def: RuleInterface }[] {
    return ruleDefinitions
      .map((def) => ({
        def,
        ctor: this.availableRules.find((p) => p.slug === def.slug),
      }))
      .map(({ ctor, def }) => {
        if (ctor === undefined) {
          throw new UnprocessableRuleSetException(`Unknown rule ${def.slug}`);
        }
        return { ctor, params: def.parameters };
      })
      .reduce((acc, { ctor, params }) => {
        if (ctor.type === META) {
          acc.push(...this.resolve((new ctor(params) as MetaRuleInterface).build()));
        } else {
          acc.push({ ctor, params });
        }
        return acc;
      }, []);
  }

  apply(context: RuleHandlerParamsInterface): Map<string, string> {
    let { result, ...ctx } = context;
    this.filterSet.filter(ctx);
    const initialState = this.statefulSet.buildInitialState(ctx);
    ctx = this.transformerSet.transform(ctx);
    result = this.setterSet.set(ctx);
    result = this.modifierSet.modify(ctx, result);
    context.result = result;
    this.nativeSet.apply(context);
    context.stack.push(`pathresult: ${context.result}`);
    return initialState;
  }

  listStateKeys(incentive: IncentiveInterface): string[] {
    return this.statefulSet.listStateKeys(incentive);
  }

  applyStateful(incentive: IncentiveInterface, meta: MetaInterface): number {
    return this.statefulSet.apply(incentive, meta);
  }
}
