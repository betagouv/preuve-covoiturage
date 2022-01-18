import { LOWEST, priority } from '../helpers/priority';
import { type, STATEFUL } from '../helpers/type';
import { StatefulRuleInterface, RuleHandlerContextInterface } from '../interfaces';
import { MetadataWrapperInterface } from '../../interfaces';

interface StatefulParametersDefaultInterface {
  uuid: string;
}

export abstract class AbstractStatefulRule<P extends StatefulParametersDefaultInterface>
  implements StatefulRuleInterface
{
  static readonly type: type = STATEFUL;
  static readonly priority: priority = LOWEST;

  static readonly slug: string;
  static readonly schema?: { [k: string]: any };
  static readonly description?: string;

  constructor(protected parameters: P) {}

  get uuid(): string {
    return this.parameters.uuid;
  }

  abstract initState(context: RuleHandlerContextInterface, meta: MetadataWrapperInterface): void;
  abstract apply(result: number, state: number): number;
  abstract getNewState(result: number, oldState: number, meta: MetadataWrapperInterface): number;
}
