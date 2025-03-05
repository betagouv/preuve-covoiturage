import { ConfigInterfaceResolver, ContextType, ForbiddenException, handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";

import { handlerConfig, ParamsInterface, ResultInterface } from "../contracts/findApplication.contract.ts";

import { alias } from "../contracts/findApplication.schema.ts";

import { createSignatory } from "@/lib/crypto/index.ts";
import { castToStatusEnum } from "@/pdc/providers/carpool/helpers/castStatus.ts";
import { RegisteredCeeApplication } from "@/pdc/services/cee/interfaces/CeeRepositoryProviderInterface.ts";
import { getOperatorIdOrFail } from "../helpers/getOperatorIdOrFail.ts";
import { CeeRepositoryProviderInterfaceResolver } from "../interfaces/index.ts";

@handler({
  ...handlerConfig,
  middlewares: [["validate", alias]],
  apiRoute: {
    path: "/policies/cee/:uuid",
    action: findCeeSignature,
    method: "GET",
    successHttpCode: 200,
    rateLimiter: {
      key: "rl-cee",
      limit: 20_000,
      windowMinute: 1,
    },
  },
})
export class FindCeeAction extends AbstractAction {
  protected signatory: ((message: string) => Promise<string>) | undefined;
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
    const operator_id = getOperatorIdOrFail(context);

    const application = await this.ceeRepository.findCeeByUuid(
      params.uuid,
    );

    if (operator_id !== application.operator_id) {
      throw new ForbiddenException();
    }

    return {
      uuid: application.uuid,
      datetime: application.datetime.toISOString(),
      journey_id: application.journey_id,
      status: castToStatusEnum({
        acquisition_status: application.acquisition_status,
        fraud_status: application.fraud_status,
        anomaly_status: application.anomaly_status,
      }),
      token: await this.sign(application),
    };
  }

  private async sign(application: RegisteredCeeApplication): Promise<string> {
    if (!this.signatory) {
      const private_key = this.config.get("signature.private_key");
      this.signatory = await createSignatory(private_key);
    }
    const data = [
      application.operator_siret.toString(),
      application.journey_type.toString(),
      application.driving_license,
      application.datetime.toISOString(),
    ].join("/");
    const sign = await this.signatory(data);
    return sign;
  }
}
