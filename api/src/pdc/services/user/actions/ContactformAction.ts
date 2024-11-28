import { ConfigInterfaceResolver, handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";

import { handlerConfig, ParamsInterface, ResultInterface } from "../contracts/contactform.contract.ts";
import { alias } from "../contracts/contactform.schema.ts";
import { UserNotificationProvider } from "../providers/UserNotificationProvider.ts";

@handler({
  ...handlerConfig,
  middlewares: [
    ["validate", alias],
    hasPermissionMiddleware("common.user.contactform"),
  ],
})
export class ContactformAction extends AbstractAction {
  constructor(
    private config: ConfigInterfaceResolver,
    private notify: UserNotificationProvider,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    await this.notify.contactForm(params);
  }
}
