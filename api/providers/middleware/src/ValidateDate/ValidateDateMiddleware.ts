import { get, set } from 'lodash';
import { startOfDay, endOfDay } from 'date-fns';
import {
  MiddlewareInterface,
  ContextType,
  ParamsType,
  ResultType,
  InvalidParamsException,
  middleware,
} from '@ilos/common';

export type ValidateDateMiddlewareOptionsType = {
  startPath: string;
  endPath: string;
  minStart?: () => Date;
  maxEnd?: () => Date;
  applyDefault?: boolean;
};

@middleware()
export class ValidateDateMiddleware implements MiddlewareInterface {
  async process(
    params: ParamsType,
    context: ContextType,
    next: Function,
    options: ValidateDateMiddlewareOptionsType,
  ): Promise<ResultType> {
    if (!options.startPath || !options.endPath || Reflect.ownKeys(options).length < 3) {
      throw new InvalidParamsException('Middleware is not properly configured');
    }

    const { startPath, endPath, minStart: minStartFn, maxEnd: maxEndFn, applyDefault: applyDefaultOpt } = options;
    const minStart: Date | undefined = minStartFn ? startOfDay(minStartFn()) : undefined;
    const maxEnd: Date | undefined = maxEndFn ? endOfDay(maxEndFn()) : undefined;
    const applyDefault = applyDefaultOpt ?? false;
    const startDate: Date | undefined = get(params, startPath, undefined);
    const endDate: Date | undefined = get(params, endPath, undefined);

    if (startDate && endDate && startDate > endDate) {
      throw new InvalidParamsException('Start should be before end');
    }

    if (minStart && ((startDate && startDate < minStart) || (!startDate && !applyDefault))) {
      throw new InvalidParamsException(`Start should be after ${minStart.toDateString()}`);
    }

    if (maxEnd && ((endDate && endDate > maxEnd) || (!endDate && !applyDefault))) {
      throw new InvalidParamsException(`End should be before ${maxEnd.toDateString()}`);
    }

    if (applyDefault) {
      if (!startDate) {
        set(params, startPath, minStart);
      }
      if (!endDate) {
        set(params, endPath, maxEnd);
      }
    }

    return next(params, context);
  }
}
