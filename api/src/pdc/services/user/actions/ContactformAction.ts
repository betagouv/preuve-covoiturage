import { ConfigInterfaceResolver, handler } from '/ilos/common/index.ts';
import { Action as AbstractAction } from '/ilos/core/index.ts';
import { hasPermissionMiddleware } from '/pdc/providers/middleware/index.ts';

import { alias } from '/shared/user/contactform.schema.ts';
import { handlerConfig, ParamsInterface, ResultInterface } from '/shared/user/contactform.contract.ts';
import { UserNotificationProvider } from '../providers/UserNotificationProvider.ts';

@handler({
  ...handlerConfig,
  middlewares: [['validate', alias], hasPermissionMiddleware('common.user.contactform')],
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
