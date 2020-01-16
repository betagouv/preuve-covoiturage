import { FILTER } from '../helpers/type';
import { HIGH } from '../helpers/priority';
import { RuleHandlerParamsInterface, FilterRuleInterface, RuleHandlerContextInterface } from '../interfaces';
import { AbstractRule } from './AbstractRule';
import { NotApplicableTargetException } from '../exceptions/NotApplicableTargetException';

export abstract class FilterRule<P = any> extends AbstractRule<P> implements FilterRuleInterface {
  static readonly type = FILTER;
  static readonly priority = HIGH;

  async apply(context: RuleHandlerParamsInterface): Promise<void> {
    const { result, ...ctx } = context;
    await this.filter(ctx);
  }

  abstract async filter(context: RuleHandlerContextInterface): Promise<void>;
}
