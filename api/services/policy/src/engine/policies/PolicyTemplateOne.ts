import { PolicyHandlerInterface, PolicyHandlerParamsInterface, PolicyHandlerStaticInterface } from '../../interfaces';
import { ConfiguredLimitInterface, LimitTargetEnum, watchForPersonMaxTripByDay } from '../helpers';
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

  protected limits: Array<ConfiguredLimitInterface> = [
    ['8C5251E8-AB82-EB29-C87A-2BF59D4F6328', 6, watchForPersonMaxTripByDay, LimitTargetEnum.Driver],
  ];
};
