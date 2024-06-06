import { Action as AbstractAction } from '@/ilos/core/index.ts';
import { handler } from '@/ilos/common/index.ts';
import { internalOnlyMiddlewares } from '@/pdc/providers/middleware/index.ts';

import { handlerConfig, ParamsInterface, ResultInterface } from '@/shared/user/notify.contract.ts';
import { UserNotificationProvider } from '../providers/UserNotificationProvider.ts';

/*
 * Send email to user
 */
@handler({ ...handlerConfig, middlewares: [...internalOnlyMiddlewares(handlerConfig.service, 'trip', 'proxy')] })
export class NotifyUserAction extends AbstractAction {
  constructor(protected notificationProvider: UserNotificationProvider) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    await this.notificationProvider.sendEmail(params);
  }
}
