import { _, endOfDay, startOfDay } from "@/deps.ts";
import {
  ContextType,
  InvalidParamsException,
  middleware,
  MiddlewareInterface,
  ParamsType,
  ResultType,
} from "@/ilos/common/index.ts";
import { ConfiguredMiddleware } from "../interfaces.ts";

/*
 * Check date validity
 */
@middleware()
export class ValidateDateMiddleware
  implements MiddlewareInterface<ValidateDateMiddlewareParams> {
  async process(
    params: ParamsType,
    context: ContextType,
    next: Function,
    options: ValidateDateMiddlewareParams,
  ): Promise<ResultType> {
    if (
      !options.startPath || !options.endPath ||
      Reflect.ownKeys(options).length < 3
    ) {
      throw new InvalidParamsException("Middleware is not properly configured");
    }

    const {
      startPath,
      endPath,
      minStart: minStartFn,
      maxEnd: maxEndFn,
      applyDefault: applyDefaultOpt,
    } = options;
    const minStart: Date | undefined = minStartFn
      ? startOfDay(minStartFn(params, context))
      : undefined;
    const maxEnd: Date | undefined = maxEndFn
      ? endOfDay(maxEndFn(params, context))
      : undefined;
    const applyDefault = applyDefaultOpt ?? false;
    const startDate: Date | undefined = _.get(params, startPath, undefined);
    const endDate: Date | undefined = _.get(params, endPath, undefined);

    if (startDate && endDate && startDate > endDate) {
      throw new InvalidParamsException("Start should be before end");
    }

    if (
      minStart &&
      ((startDate && startDate < minStart) || (!startDate && !applyDefault))
    ) {
      throw new InvalidParamsException(
        `Start should be after ${minStart.toDateString()}`,
      );
    }

    if (
      maxEnd && ((endDate && endDate > maxEnd) || (!endDate && !applyDefault))
    ) {
      throw new InvalidParamsException(
        `End should be before ${maxEnd.toDateString()}`,
      );
    }

    if (applyDefault) {
      if (!startDate) {
        _.set(params, startPath, minStart);
      }
      if (!endDate) {
        _.set(params, endPath, maxEnd);
      }
    }

    return next(params, context);
  }
}

export type ValidateDateMiddlewareParams = {
  startPath: string;
  endPath: string;
  minStart?: (params: ParamsType, context: ContextType) => Date;
  maxEnd?: (params: ParamsType, context: ContextType) => Date;
  applyDefault?: boolean;
};

const alias = "validate.date";

export const validateDateMiddlewareBinding = [alias, ValidateDateMiddleware];

export function validateDateMiddleware(
  params: ValidateDateMiddlewareParams,
): ConfiguredMiddleware<ValidateDateMiddlewareParams> {
  return [alias, params];
}
