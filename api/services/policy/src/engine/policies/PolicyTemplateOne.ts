import { PolicyHandlerInterface, PolicyHandlerParamsInterface, PolicyHandlerStaticInterface } from '../../interfaces';
import { ConfiguredLimitInterface } from '../helpers';
import { AbstractPolicyHandler } from './AbstractPolicyHandler';

export const PolicyTemplateOne: PolicyHandlerStaticInterface = class
  extends AbstractPolicyHandler
  implements PolicyHandlerInterface
{
  params(): PolicyHandlerParamsInterface {
    throw new Error('Method not implemented.');
  }
  describe(): string {
    throw new Error('Method not implemented.');
  }

  static readonly id = '1';

  protected limits: Array<ConfiguredLimitInterface> = [];
};
