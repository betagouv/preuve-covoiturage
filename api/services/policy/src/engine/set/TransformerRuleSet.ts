import { AbstractRuleSet } from './AbstractRuleSet';
import {
  TransformerRuleInterface,
  RuleHandlerContextInterface,
  StaticRuleInterface,
  RuleHandlerParamsInterface,
} from '../interfaces';
import { type, TRANSFORMER } from '../helpers/type';

export class TransformerRuleSet extends AbstractRuleSet<TransformerRuleInterface> implements TransformerRuleInterface {
  readonly type: type = TRANSFORMER;

  constructor(rules: { ctor: StaticRuleInterface; params?: any }[]) {
    super();
    this.getRules(this.type, rules);
  }

  apply(context: RuleHandlerParamsInterface): void {
    const newContext = this.transform(context);
    Object.keys(newContext).forEach((k) => {
      context[k] = newContext[k];
    });
  }

  transform(context: RuleHandlerContextInterface): RuleHandlerContextInterface {
    if (this.ruleSet.length === 0) {
      return context;
    }

    let currentContext = JSON.parse(JSON.stringify(context));
    for (const rule of this.ruleSet) {
      currentContext = rule.transform(currentContext);
      context.stack.push((this.ruleSet[0].constructor as StaticRuleInterface).slug);
    }

    return currentContext;
  }
}
