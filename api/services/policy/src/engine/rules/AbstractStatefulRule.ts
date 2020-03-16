import { LOWEST, priority } from '../helpers/priority';
import { type, STATEFUL } from '../helpers/type';
import { ResultInterface, StatefulRuleInterface, RuleHandlerContextInterface } from '../interfaces';
import { MetaInterface } from '../interfaces';

interface StatefulParametersDefaultInterface {
  uuid: string;
}

export abstract class AbstractStatefulRule<P extends StatefulParametersDefaultInterface>
  implements StatefulRuleInterface {
  static readonly type: type = STATEFUL;
  static readonly priority: priority = LOWEST;

  static readonly slug: string;
  static readonly schema?: { [k: string]: any };
  static readonly description?: string;

  constructor(protected parameters: P) {}

  get uuid() {
    return this.parameters.uuid;
  }

  abstract getState(context: RuleHandlerContextInterface, metaGetter: MetaInterface): number;
  abstract apply(result: ResultInterface, state: number): ResultInterface;
  abstract setState(result: ResultInterface, state: number): number;
}
