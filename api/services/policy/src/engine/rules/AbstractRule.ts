import { priority, LOWEST } from '../helpers/priority';
import { type, DEFAULT } from '../helpers/type';
import { RuleHandlerParamsInterface, AppliableRuleInterface } from '../interfaces';

export abstract class AbstractRule<P = any> implements AppliableRuleInterface {
  static readonly type: type = DEFAULT;
  static readonly priority: priority = LOWEST;

  static readonly slug: string;
  static readonly schema?: { [k: string]: any };
  static readonly description?: string;

  constructor(protected parameters?: P) {}

  abstract apply(context: RuleHandlerParamsInterface): void;
}
