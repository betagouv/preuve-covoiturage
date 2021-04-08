import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/user/notify.contract';
import { UserNotificationProvider } from '../providers/UserNotificationProvider';

/*
 * Send email to user
 */
@handler({ ...handlerConfig, middlewares: [...internalOnlyMiddlewares(handlerConfig.service, 'trip', 'proxy')] })
export class NotifyUserAction extends AbstractAction {
  constructor(
    protected notificationProvider: UserNotificationProvider,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    await this.notificationProvider.sendEmail(params);
  }
}
