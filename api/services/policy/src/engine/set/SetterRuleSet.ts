import { AbstractRuleSet } from './AbstractRuleSet';
import {
  SetterRuleInterface,
  RuleHandlerContextInterface,
  StaticRuleInterface,
  RuleHandlerParamsInterface,
} from '../interfaces';
import { type, SETTER } from '../helpers/type';

export class SetterRuleSet extends AbstractRuleSet<SetterRuleInterface> implements SetterRuleInterface {
  readonly type: type = SETTER;

  constructor(rules: { ctor: StaticRuleInterface; params?: any }[]) {
    super();
    this.getRules(this.type, rules);
  }

  apply(context: RuleHandlerParamsInterface): void {
    const { result, ...ctx } = context;
    context.result = this.set(ctx);
  }

  set(context: RuleHandlerContextInterface): number {
    let result = 0;
    if (this.ruleSet.length > 0) {
      // take the first, ignore others
      result = this.ruleSet[0].set(context);
      context.stack.push(`${(this.ruleSet[0].constructor as StaticRuleInterface).slug} : ${result}`);
    }
    return result;
  }
}
