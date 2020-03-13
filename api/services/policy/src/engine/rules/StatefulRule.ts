import { STATEFUL } from '../helpers/type';
import { LOWEST } from '../helpers/priority';
import { RuleHandlerParamsInterface } from '../interfaces';
import { AbstractRule } from './AbstractRule';

export abstract class StatefulRule<P = any> extends AbstractRule<P> {
  static readonly type = STATEFUL;
  static readonly priority = LOWEST;

  abstract async apply(context: RuleHandlerParamsInterface): Promise<void>;
}
