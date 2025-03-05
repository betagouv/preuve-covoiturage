import { defaultTimezone } from "@/config/time.ts";
import { handler } from "@/ilos/common/Decorators.ts";
import { ContextType, KernelInterfaceResolver } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { get } from "@/lib/object/index.ts";
import { toISOString } from "@/pdc/helpers/dates.helper.ts";
import { DefaultTimezoneMiddleware } from "@/pdc/middlewares/DefaultTimezoneMiddleware.ts";
import { copyFromContextMiddleware } from "@/pdc/providers/middleware/middlewares.ts";
import {
  handlerConfigV2,
  ParamsInterfaceV2,
  ParamsInterfaceV3,
  ResultInterfaceV2,
  ResultInterfaceV3,
  signatureV3,
} from "../contracts/create.contract.ts";
import { aliasV2 } from "../contracts/create.schema.ts";

/**
 * @deprecated
 */
@handler({
  ...handlerConfigV2,
  middlewares: [
    ["validate", aliasV2],
    ["timezone", DefaultTimezoneMiddleware],
    copyFromContextMiddleware(`call.user.operator_id`, "operator_id", false),
    copyFromContextMiddleware(`call.user.territory_id`, "territory_id", false),
  ],
  apiRoute: {
    path: "/v2/exports",
    action: "export:createVersionTwo",
    method: "POST",
    successHttpCode: 201,
  },
})
export class CreateActionV2 extends AbstractAction {
  constructor(private kernel: KernelInterfaceResolver) {
    super();
  }

  protected async handle(
    paramsV2: ParamsInterfaceV2,
    context: ContextType,
  ): Promise<ResultInterfaceV2> {
    // dates are sent to the API as strings
    // override date params as string to please AJV.
    type AJVParams = Omit<ParamsInterfaceV3, "start_at" | "end_at"> & {
      start_at: string;
      end_at: string;
    };

    const paramsV3: AJVParams = {
      tz: paramsV2.tz || defaultTimezone,
      start_at: toISOString(paramsV2.date.start),
      end_at: toISOString(paramsV2.date.end),
      operator_id: paramsV2.operator_id || [],
      created_by: get(context, "call.user._id", null),
    };

    if (paramsV2.geo_selector) {
      paramsV3.geo_selector = paramsV2.geo_selector;
    }

    const resultV3 = await this.kernel.call<AJVParams, ResultInterfaceV3>(
      signatureV3,
      paramsV3,
      context,
    );
    const resultV2 = resultV3; // TODO convert V3 -> V2

    return resultV2;
  }
}
