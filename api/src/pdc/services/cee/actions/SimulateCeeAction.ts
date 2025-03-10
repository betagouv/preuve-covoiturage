import { ConfigInterfaceResolver, ContextType, handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";

import { handlerConfig, ParamsInterface, ResultInterface } from "../contracts/simulateApplication.contract.ts";
import { alias } from "../contracts/simulateApplication.schema.ts";

import { ServiceDisabledException } from "@/ilos/common/exceptions/index.ts";
import { ConflictException } from "@/ilos/common/index.ts";
import { env_or_false } from "@/lib/env/index.ts";
import { getOperatorIdOrFail } from "../helpers/getOperatorIdOrFail.ts";
import {
  ApplicationCooldownConstraint,
  CeeJourneyTypeEnum,
  CeeRepositoryProviderInterfaceResolver,
} from "../interfaces/index.ts";

@handler({
  ...handlerConfig,
  middlewares: [["validate", alias]],
  apiRoute: {
    path: "/policies/cee/simulate",
    method: "POST",
    successHttpCode: 200,
    rateLimiter: {
      key: "rl-cee",
      limit: 20_000,
      windowMinute: 1,
    },
  },
})
export class SimulateCeeAction extends AbstractAction {
  constructor(
    protected ceeRepository: CeeRepositoryProviderInterfaceResolver,
    protected config: ConfigInterfaceResolver,
  ) {
    super();
  }

  public async handle(
    params: ParamsInterface,
    context: ContextType,
  ): Promise<ResultInterface> {
    if (env_or_false("APP_DISABLE_CEE_IMPORT")) {
      throw new ServiceDisabledException();
    }

    const operator_id = getOperatorIdOrFail(context);

    const constraint: ApplicationCooldownConstraint = this.config.get(
      "rules.applicationCooldownConstraint",
    );
    const search = { ...params, datetime: new Date() };
    const data = params.journey_type === CeeJourneyTypeEnum.Short
      ? await this.ceeRepository.searchForShortApplication(search, constraint)
      : await this.ceeRepository.searchForLongApplication(search, constraint);
    if (!data) {
      return;
    }
    if (data.operator_id === operator_id) {
      throw new ConflictException({
        uuid: data.uuid,
        datetime: data.datetime.toISOString(),
      });
    } else {
      throw new ConflictException({
        datetime: data.datetime.toISOString(),
      });
    }
  }
}
