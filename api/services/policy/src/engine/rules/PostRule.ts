import { POST } from '../helpers/type';
import { LOWEST } from '../helpers/priority';
import { RuleHandlerParamsInterface } from '../interfaces';
import { AbstractRule } from './AbstractRule';

export abstract class PostRule<P = any> extends AbstractRule<P> {
  static readonly type = POST;
  static readonly priority = LOWEST;

  abstract async apply(context: RuleHandlerParamsInterface): Promise<void>;
}
