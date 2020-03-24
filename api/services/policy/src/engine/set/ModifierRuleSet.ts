import { AbstractRuleSet } from './AbstractRuleSet';
import {
  ModifierRuleInterface,
  RuleHandlerContextInterface,
  StaticRuleInterface,
  RuleHandlerParamsInterface,
} from '../interfaces';
import { type, MODIFIER } from '../helpers/type';

export class ModifierRuleSet extends AbstractRuleSet<ModifierRuleInterface> implements ModifierRuleInterface {
  readonly type: type = MODIFIER;

  constructor(rules: { ctor: StaticRuleInterface; params?: any }[]) {
    super();
    this.getRules(this.type, rules);
  }

  apply(context: RuleHandlerParamsInterface): void {
    const { result, ...ctx } = context;
    context.result = this.modify(ctx, result);
  }

  modify(context: RuleHandlerContextInterface, result: number): number {
    if (this.ruleSet.length === 0) {
      return result;
    }

    let currentResult = result;
    for (const rule of this.ruleSet) {
      currentResult = rule.modify(context, currentResult);
      context.stack.push(`${(rule.constructor as StaticRuleInterface).slug} : ${currentResult}`);
    }

    return currentResult;
  }
}
