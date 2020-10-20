import { MiddlewareInterface, ContextType, ResultType, InvalidParamsException, middleware } from '@ilos/common';

import { CampaignInterface } from '../shared/policy/common/interfaces/CampaignInterface';

export type ValidateDateMiddlewareOptionsType = [Date, Date];

@middleware()
export class ValidateDateMiddleware implements MiddlewareInterface {
  async process(
    params: CampaignInterface,
    context: ContextType,
    next: Function,
    options?: ValidateDateMiddlewareOptionsType,
  ): Promise<ResultType> {
    if (params.start_date > params.end_date) {
      throw new InvalidParamsException('Start should be before end');
    }
    if (options) {
      const [minStart, maxEnd] = options;
      if (minStart && params.start_date < minStart) {
        throw new InvalidParamsException(`Start should be after ${minStart.toDateString()}`);
      }
      if (maxEnd && params.end_date > maxEnd) {
        throw new InvalidParamsException(`End should be before ${maxEnd.toDateString()}`);
      }
    }
    return next(params, context);
  }
}
