import { ContextType, handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";

import { handlerConfig, ParamsInterface, ResultInterface } from "../contracts/importApplicationIdentity.contract.ts";
import { alias } from "../contracts/importApplicationIdentity.schema.ts";

import { ServiceDisabledException } from "@/ilos/common/exceptions/index.ts";
import { env_or_false } from "@/lib/env/index.ts";
import {
  CeeImportSpecificApplicationIdentityInterface,
  CeeImportStandardizedApplicationIdentityInterface,
} from "../contracts/common/CeeApplicationInterface.ts";
import { timestampSchema } from "../contracts/common/ceeSchema.ts";
import { getDateOrFail } from "../helpers/getDateOrFail.ts";
import { getOperatorIdOrFail } from "../helpers/getOperatorIdOrFail.ts";
import { CeeRepositoryProviderInterfaceResolver } from "../interfaces/index.ts";

@handler({
  ...handlerConfig,
  middlewares: [["validate", alias]],
  apiRoute: {
    path: "/policies/cee/import/identity",
    method: "POST",
    successHttpCode: 200,
    rateLimiter: {
      key: "rl-cee",
      limit: 20_000,
      windowMinute: 1,
    },
  },
})
export class ImportCeeIdentityAction extends AbstractAction {
  constructor(protected ceeRepository: CeeRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(
    params: ParamsInterface,
    context: ContextType,
  ): Promise<ResultInterface> {
    if (env_or_false("APP_DISABLE_CEE_IMPORT_IDENTITY")) {
      throw new ServiceDisabledException();
    }

    const operator_id = getOperatorIdOrFail(context);

    const result: ResultInterface = {
      imported: 0,
      failed: 0,
      failed_details: [],
    };

    const specificData = params
      .filter((p) =>
        p.cee_application_type === "specific" &&
        !("cee_application_uuid" in p) && "phone_trunc" in p
      )
      .map((d: CeeImportSpecificApplicationIdentityInterface, i) => ({
        ...d,
        operator_id,
        datetime: getDateOrFail(
          d.datetime,
          `data/${i}/datetime ${timestampSchema.errorMessage}`,
        ),
        application_timestamp: getDateOrFail(
          d.datetime,
          `data/${i}/datetime ${timestampSchema.errorMessage}`,
        ),
      }));

    for (const application of specificData) {
      try {
        await this.ceeRepository.importSpecificApplicationIdentity(application);
        result.imported += 1;
      } catch (e) {
        result.failed += 1;
        result.failed_details.push({ ...application, error: e.message });
      }
    }

    const standardizedData = params.filter(
      (p) =>
        p.cee_application_type === "standardized" ||
        "cee_application_uuid" in p,
    );

    for (
      const {
        cee_application_uuid,
        identity_key,
      } of standardizedData as Array<
        CeeImportStandardizedApplicationIdentityInterface
      >
    ) {
      const application = { operator_id, cee_application_uuid, identity_key };
      try {
        await this.ceeRepository.importStandardizedApplicationIdentity(
          application,
        );
        result.imported += 1;
      } catch (e) {
        result.failed += 1;
        result.failed_details.push({
          ...application,
          cee_application_type: "standardized",
          error: e.message,
        });
      }
    }

    return result;
  }
}
