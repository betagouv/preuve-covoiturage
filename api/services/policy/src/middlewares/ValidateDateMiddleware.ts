import { get } from 'lodash';
import { MiddlewareInterface, ContextType, ResultType, InvalidParamsException, middleware } from '@ilos/common';

import { CampaignInterface } from '../shared/policy/common/interfaces/CampaignInterface';

type DateFunctionType = () => [Date, Date];
export type ValidateDateMiddlewareOptionsType = [string, DateFunctionType];

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
    const [dataPath, dateFn] = options;
    const [minStart, maxEnd] = dateFn();

    const campaign: CampaignInterface = get(params, dataPath, params);

    if (!campaign.start_date || !campaign.end_date) {
      throw new InvalidParamsException('Missing start/end dates');
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

    return next(params, context);
  }
}
