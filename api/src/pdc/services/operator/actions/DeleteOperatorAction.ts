import {
  ContextType,
  handler,
  KernelInterfaceResolver,
} from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";
import { Sentry } from "@/pdc/providers/sentry/index.ts";

import { logger } from "@/lib/logger/index.ts";
import { get } from "@/lib/object/index.ts";
import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from "@/shared/operator/delete.contract.ts";
import { alias } from "@/shared/operator/delete.schema.ts";
import { OperatorRepositoryProviderInterfaceResolver } from "../interfaces/OperatorRepositoryProviderInterface.ts";

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware("registry.operator.delete"), [
    "validate",
    alias,
  ]],
})
export class DeleteOperatorAction extends AbstractAction {
  constructor(
    private kernel: KernelInterfaceResolver,
    private operatorRepository: OperatorRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(
    params: ParamsInterface,
    context: ContextType,
  ): Promise<ResultInterface> {
    await this.operatorRepository.delete(params._id);

    const ctx = { channel: { service: "operator" } };

    // delete users associated with this operator
    try {
      await this.kernel.call("user:deleteAssociated", {
        operator_id: params._id,
      }, ctx);
      logger.debug(`> deleted associated users to operator ${params._id}`);
    } catch (e) {
      logger.error(`> Failed to remove associated users`, e);

      // We want errors to be non-blocking but they are logged
      Sentry.setUser(get(context, "call.user", null));
      Sentry.captureException(e);
    }

    // search for operator's applications and revoke them
    try {
      for (
        const { uuid, owner_id } of await this.kernel.call(
          "application:list",
          { owner_id: params._id, owner_service: "operator" },
          {
            ...ctx,
            ...{
              call: {
                user: {
                  operator_id: params._id,
                  permissions: ["operator.application.list"],
                },
              },
            },
          },
        )
      ) {
        await this.kernel.call(
          "application:revoke",
          { uuid },
          {
            ...ctx,
            ...{
              call: {
                user: {
                  operator_id: owner_id,
                  permissions: ["operator.application.revoke"],
                },
              },
            },
          },
        );
        logger.debug(`> revoked app:`, { uuid, owner_id });
      }
    } catch (e) {
      logger.error(`> Failed to remove associated applications`, e);
      Sentry.setUser(get(context, "call.user", null));
      Sentry.captureException(e);
    }

    return true;
  }
}
