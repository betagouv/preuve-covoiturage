import { get } from 'lodash';
import { MiddlewareInterface, ContextType, ResultType, InvalidParamsException, middleware } from '@ilos/common';

import { CampaignInterface } from '../shared/policy/common/interfaces/CampaignInterface';

export type ValidateDateMiddlewareOptionsType = [string, Date, Date];

@middleware()
export class ValidateDateMiddleware implements MiddlewareInterface {
  async process(
    params: any,
    context: ContextType,
    next: Function,
    options: ValidateDateMiddlewareOptionsType,
  ): Promise<ResultType> {
    if (!options.length) {
      throw new InvalidParamsException('Middleware is not properly configured');
    }
    const [dataPath, minStart, maxEnd] = options;
    const campaign: CampaignInterface = get(params, dataPath, params);

    if (!campaign.start_date || !campaign.end_date) {
      throw new InvalidParamsException('Middleware is not properly configured, missing data');
    }

    if (campaign.start_date > campaign.end_date) {
      throw new InvalidParamsException('Start should be before end');
    }

    if (minStart && campaign.start_date < minStart) {
      throw new InvalidParamsException(`Start should be after ${minStart.toDateString()}`);
    }

    if (maxEnd && campaign.end_date > maxEnd) {
      throw new InvalidParamsException(`End should be before ${maxEnd.toDateString()}`);
    }

    // Set proper time
    campaign.start_date.setHours(0, 0, 0, 0);
    campaign.end_date.setHours(23, 59, 59, 999);

    return next(params, context);
  }
}
