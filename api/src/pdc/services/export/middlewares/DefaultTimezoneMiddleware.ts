import { NextFunction } from "@/deps.ts";
import { ContextType, middleware } from "@/ilos/common/index.ts";
import { ParamsInterfaceV3 } from "@/shared/export/create.contract.ts";

@middleware()
export class DefaultTimezoneMiddleware {
  async process(
    params: ParamsInterfaceV3,
    context: ContextType,
    next: NextFunction,
  ): Promise<unknown> {
    if (!params.tz) {
      params.tz = "Europe/Paris";
    }

    return next(params, context);
  }
}
