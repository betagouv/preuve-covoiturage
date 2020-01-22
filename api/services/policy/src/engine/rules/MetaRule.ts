import { RuleInterface, MetaRuleInterface, RuleHandlerParamsInterface } from '../interfaces';
import { AbstractRule } from './AbstractRule';
import { META } from '../helpers/type';
import { HIGHEST } from '../helpers/priority';

export abstract class MetaRule<P = any> extends AbstractRule<P> implements MetaRuleInterface {
  static readonly type = META;
  static readonly priority = HIGHEST;

  async apply(context: RuleHandlerParamsInterface): Promise<void> {
    throw new Error();
  }

  abstract build(): RuleInterface[];
}
