import { ContextType, handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";

import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from "@/shared/cee/importApplication.contract.ts";

import { alias } from "@/shared/cee/importApplication.schema.ts";

import { env_or_false } from "@/lib/env/index.ts";
import { timestampSchema } from "@/shared/cee/common/ceeSchema.ts";
import { ServiceDisabledError } from "../errors/ServiceDisabledError.ts";
import { getDateOrFail } from "../helpers/getDateOrFail.ts";
import { getOperatorIdOrFail } from "../helpers/getOperatorIdOrFail.ts";
import { CeeRepositoryProviderInterfaceResolver } from "../interfaces/index.ts";

@handler({
  ...handlerConfig,
  middlewares: [["validate", alias]],
})
export class ImportCeeAction extends AbstractAction {
  constructor(protected ceeRepository: CeeRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(
    params: ParamsInterface,
    context: ContextType,
  ): Promise<ResultInterface> {
    if (env_or_false("APP_DISABLE_CEE_IMPORT")) {
      throw new ServiceDisabledError();
    }

    const operator_id = getOperatorIdOrFail(context);
    const data = params.map((d, i) => ({
      ...d,
      datetime: getDateOrFail(
        d.datetime,
        `data/${i}/datetime: ${timestampSchema.errorMessage}`,
      ),
    }));

    const result: ResultInterface = {
      imported: 0,
      failed: 0,
      failed_details: [],
    };

    for (const application of data) {
      try {
        await this.ceeRepository.importApplication({
          ...application,
          operator_id,
          application_timestamp: application.datetime,
        });
        result.imported += 1;
      } catch (e) {
        result.failed += 1;
        result.failed_details.push({
          ...application,
          datetime: application.datetime.toISOString(),
          error: e.message,
        });
      }
    }

    return result;
  }
}
