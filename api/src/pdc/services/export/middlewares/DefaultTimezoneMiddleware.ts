import { defaultTimezone } from "@/config/time.ts";
import { NextFunction } from "@/deps.ts";
import { ContextType, middleware } from "@/ilos/common/index.ts";
import { ParamsInterfaceV3 } from "@/shared/export/create.contract.ts";

/**
 * Set the params.tz property to the default time zone
 * if it is not already set.
 */
@middleware()
export class DefaultTimezoneMiddleware {
  async process(
    params: ParamsInterfaceV3,
    context: ContextType,
    next: NextFunction,
  ): Promise<unknown> {
    if (!params.tz) {
      params.tz = defaultTimezone;
    }

    return next(params, context);
  }
}
