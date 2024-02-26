import { ConfigInterfaceResolver, handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { hasPermissionMiddleware } from '@pdc/provider-middleware';

import { alias } from '../shared/user/contactform.schema';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/user/contactform.contract';
import { UserNotificationProvider } from '../providers/UserNotificationProvider';

@handler({
  ...handlerConfig,
  middlewares: [['validate', alias], hasPermissionMiddleware('common.user.contactform')],
})
export class ContactformAction extends AbstractAction {
  constructor(private config: ConfigInterfaceResolver, private notify: UserNotificationProvider) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    await this.notify.contactForm(params);
  }
}
