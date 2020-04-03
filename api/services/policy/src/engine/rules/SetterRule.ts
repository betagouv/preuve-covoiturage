import { AbstractRule } from './AbstractRule';
import { SETTER } from '../helpers/type';
import { LOW } from '../helpers/priority';
import { SetterRuleInterface, RuleHandlerParamsInterface, RuleHandlerContextInterface } from '../interfaces';

export abstract class SetterRule<P = any> extends AbstractRule<P> implements SetterRuleInterface {
  static readonly type = SETTER;
  static readonly priority = LOW;

  apply(context: RuleHandlerParamsInterface): void {
    const { result, ...ctx } = context;
    context.result = this.set(ctx);
  }

  abstract set(context: RuleHandlerContextInterface): number;
}
