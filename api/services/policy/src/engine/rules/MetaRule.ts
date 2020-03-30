import { RuleInterface, MetaRuleInterface, RuleHandlerParamsInterface } from '../interfaces';
import { AbstractRule } from './AbstractRule';
import { META } from '../helpers/type';
import { HIGHEST } from '../helpers/priority';

export abstract class MetaRule<P = any> extends AbstractRule<P> implements MetaRuleInterface {
  static readonly type = META;
  static readonly priority = HIGHEST;

  apply(context: RuleHandlerParamsInterface): void {
    throw new Error();
  }

  abstract build(): RuleInterface[];
}
