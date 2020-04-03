import { AbstractRuleSet } from './AbstractRuleSet';
import { AppliableRuleInterface, RuleHandlerParamsInterface, StaticRuleInterface } from '../interfaces';
import { type, DEFAULT } from '../helpers/type';

export class NativeRuleSet extends AbstractRuleSet<AppliableRuleInterface> implements AppliableRuleInterface {
  readonly type: type = DEFAULT;

  constructor(rules: { ctor: StaticRuleInterface; params?: any }[]) {
    super();
    this.getRules(this.type, rules);
  }

  apply(context: RuleHandlerParamsInterface): void {
    for (const rule of this.ruleSet) {
      rule.apply(context);
      context.stack.push(`${(rule.constructor as StaticRuleInterface).slug}: ${context.result}`);
    }
  }
}
