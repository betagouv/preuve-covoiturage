import { defaultTimezone } from "@/config/time.ts";
import { ContextType, middleware } from "@/ilos/common/index.ts";
import { Timezone } from "@/pdc/providers/validator/types.ts";
import { NextFunction } from "dep:express";

/**
 * Set the params.tz property to the default time zone
 * if it is not already set.
 */
@middleware()
export class DefaultTimezoneMiddleware<TParams extends { tz: Timezone }> {
  async process(
    params: TParams,
    context: ContextType,
    next: NextFunction,
  ): Promise<unknown> {
    if (!params.tz) {
      params.tz = defaultTimezone;
    }

    return next(params, context);
  }
}
