import { priority, LOWEST } from '../helpers/priority';
import { type, DEFAULT } from '../helpers/type';
import { RuleHandlerParamsInterface } from '../interfaces';

export abstract class AbstractRule<P = any> {
  static readonly type: type = DEFAULT;
  static readonly priority: priority = LOWEST;

  static readonly slug: string;
  static readonly schema?: { [k: string]: any };
  static readonly description?: string;

  constructor(protected parameters?: P) {}

  abstract async apply(context: RuleHandlerParamsInterface): Promise<void>;
}
