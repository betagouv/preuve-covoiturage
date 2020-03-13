import { LOWEST, priority } from '../helpers/priority';
import { type, STATEFUL } from '../helpers/type';
import { RuleHandlerParamsInterface, StatefulRuleInterface } from '../interfaces';
import { MetaInterface } from '../../interfaces';

export abstract class AbstractStatefulRule<P = any, S = any> implements StatefulRuleInterface<S> {
  static readonly type: type = STATEFUL;
  static readonly priority: priority = LOWEST;

  static readonly slug: string;
  static readonly schema?: { [k: string]: any };
  static readonly description?: string;

  constructor(protected parameters?: P) {}

  abstract async getState(context: RuleHandlerParamsInterface, metaGetter: MetaInterface): Promise<S>;

  abstract apply(context: RuleHandlerParamsInterface, state: S): void;

  abstract async setState(context: RuleHandlerParamsInterface, metaGetter: MetaInterface, state: S): Promise<void>;
}
