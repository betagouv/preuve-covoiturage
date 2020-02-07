import { MODIFIER } from '../helpers/type';
import { LOWEST } from '../helpers/priority';
import { AbstractRule } from './AbstractRule';
import { ModifierRuleInterface, RuleHandlerParamsInterface, RuleHandlerContextInterface } from '../interfaces';

export abstract class ModifierRule<P = any> extends AbstractRule<P> implements ModifierRuleInterface {
  static readonly type = MODIFIER;
  static readonly priority = LOWEST;

  async apply(context: RuleHandlerParamsInterface): Promise<void> {
    const { result, ...ctx } = context;
    context.result = await this.modify(ctx, result);
  }

  abstract async modify(context: RuleHandlerContextInterface, result: number): Promise<number>;
}
