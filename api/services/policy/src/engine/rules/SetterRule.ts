import { AbstractRule } from './AbstractRule';
import { SETTER } from '../helpers/type';
import { LOW } from '../helpers/priority';
import { SetterRuleInterface, RuleHandlerParamsInterface, RuleHandlerContextInterface } from '../interfaces';

export abstract class SetterRule<P = any> extends AbstractRule<P> implements SetterRuleInterface {
  static readonly type = SETTER;
  static readonly priority = LOW;

  async apply(context: RuleHandlerParamsInterface): Promise<void> {
    const { result, ...ctx } = context;
    context.result = await this.set(ctx);
  }

  abstract async set(context: RuleHandlerContextInterface): Promise<number>;
}
