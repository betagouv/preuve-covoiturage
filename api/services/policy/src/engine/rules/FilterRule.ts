import { FILTER } from '../helpers/type';
import { HIGH } from '../helpers/priority';
import { RuleHandlerParamsInterface, FilterRuleInterface, RuleHandlerContextInterface } from '../interfaces';
import { AbstractRule } from './AbstractRule';

export abstract class FilterRule<P = any> extends AbstractRule<P> implements FilterRuleInterface {
  static readonly type = FILTER;
  static readonly priority = HIGH;

  apply(context: RuleHandlerParamsInterface): void {
    const { result, ...ctx } = context;
    this.filter(ctx);
  }

  abstract filter(context: RuleHandlerContextInterface): void;
}
