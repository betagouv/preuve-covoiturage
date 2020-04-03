import { TRANSFORMER } from '../helpers/type';
import { HIGH } from '../helpers/priority';
import { AbstractRule } from './AbstractRule';
import { TransformerRuleInterface, RuleHandlerParamsInterface } from '../interfaces';

export abstract class TransformerRule<P = any> extends AbstractRule<P> implements TransformerRuleInterface {
  static readonly type = TRANSFORMER;
  static readonly priority = HIGH;

  apply(context: RuleHandlerParamsInterface): void {
    const newContext = this.transform(context);
    Object.keys(newContext).forEach((k) => {
      context[k] = newContext[k];
    });
  }

  abstract transform(context: RuleHandlerParamsInterface): RuleHandlerParamsInterface;
}
