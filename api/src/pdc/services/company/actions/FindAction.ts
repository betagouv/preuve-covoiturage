import { handler, KernelInterfaceResolver, NotFoundException } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";

import { CompanyRepositoryProviderInterfaceResolver } from "../interfaces/CompanyRepositoryProviderInterface.ts";

import { logger } from "@/lib/logger/index.ts";
import { signature as fetchSignature } from "../contracts/fetch.contract.ts";
import { handlerConfig, ParamsInterface, ResultInterface } from "../contracts/find.contract.ts";
import { alias } from "../contracts/find.schema.ts";

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware("common.company.find"), [
    "validate",
    alias,
  ]],
})
export class FindAction extends AbstractAction {
  constructor(
    private repository: CompanyRepositoryProviderInterfaceResolver,
    private kernel: KernelInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    const {
      query: { siret, _id },
      forceRemoteUpdate,
    } = params;

    if (forceRemoteUpdate && siret) {
      await this.fetch(siret);
    }

    try {
      let res: ResultInterface;

      if (siret) {
        res = await this.repository.findBySiret(siret);
      } else {
        res = await this.repository.findById(_id);
      }

      if (res === null) {
        throw new NotFoundException(`Cant find this company, try force update`);
      }

      return res;
    } catch (e) {
      logger.error(e.message, e);
      return null;
    }
  }

  protected async fetch(siret: string): Promise<void> {
    await this.kernel.call(fetchSignature, siret, {
      call: {
        user: {
          permissions: ["common.company.fetch"],
        },
      },
      channel: {
        service: handlerConfig.service,
      },
    });
  }
}
