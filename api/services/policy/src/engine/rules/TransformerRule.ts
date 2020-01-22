import { TRANSFORMER } from '../helpers/type';
import { HIGH } from '../helpers/priority';
import { AbstractRule } from './AbstractRule';
import { TransformerRuleInterface, RuleHandlerParamsInterface, RuleHandlerContextInterface } from '../interfaces';

export abstract class TransformerRule<P = any> extends AbstractRule<P> implements TransformerRuleInterface {
  static readonly type = TRANSFORMER;
  static readonly priority = HIGH;

  async apply(context: RuleHandlerParamsInterface): Promise<void> {
    const newContext = await this.transform(context);
    Object.keys(newContext).forEach(k => {
      context[k] = newContext[k];
    });
  }

  abstract async transform(context: RuleHandlerParamsInterface): Promise<RuleHandlerParamsInterface>;
}
