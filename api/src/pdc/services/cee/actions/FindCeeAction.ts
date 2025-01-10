import { ConfigInterfaceResolver, ContextType, ForbiddenException, handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";

import { createSignatory } from "@/lib/crypto/index.ts";
import { castToStatusEnum } from "@/pdc/providers/carpool/helpers/castStatus.ts";
import { FindApplication } from "@/pdc/services/cee/dto/FindApplication.ts";
import { RegisteredCeeApplication } from "@/pdc/services/cee/interfaces/CeeRepositoryProviderInterface.ts";
import { getOperatorIdOrFail } from "../helpers/getOperatorIdOrFail.ts";
import { CeeApplicationResultInterface } from "../interfaces/CeeApplicationInterface.ts";
import { CeeRepositoryProviderInterfaceResolver } from "../interfaces/index.ts";

@handler({
  service: "cee",
  method: "findCeeApplication",
  middlewares: [["validate", FindApplication]],
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
    params: FindApplication,
    context: ContextType,
  ): Promise<CeeApplicationResultInterface> {
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
