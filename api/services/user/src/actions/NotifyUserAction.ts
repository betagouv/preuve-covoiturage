import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { NotificationInterfaceResolver } from '@pdc/provider-notification';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/user/notify.contract';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware/dist';

/*
 * Send email to user
 */
@handler({ ...handlerConfig, middlewares: [...internalOnlyMiddlewares('proxy')] })
export class NotifyUserAction extends AbstractAction {
  constructor(private notificationProvider: NotificationInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    const { templateId, template, email, fullname, disableTracking, ...opts } = params;

    const sendOptions = {};
    if (templateId) sendOptions['template'] = templateId;
    if (disableTracking) sendOptions['disableTracking'] = disableTracking;

    await this.notificationProvider.sendTemplateByEmail(
      {
        template,
        email,
        fullname,
        opts,
      },
      sendOptions,
    );
  }
}
