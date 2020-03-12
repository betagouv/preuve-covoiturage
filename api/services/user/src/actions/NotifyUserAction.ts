import { Action as AbstractAction } from '@ilos/core';
import { ContextType, handler } from '@ilos/common';
import { NotificationInterfaceResolver } from '@pdc/provider-notification';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/user/notify.contract';

/*
 * Send email to user
 */
@handler({ ...handlerConfig, middlewares: [['channel.service.except', ['proxy']]] })
export class NotifyUserAction extends AbstractAction {
  constructor(private notificationProvider: NotificationInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const { templateId, template, email, fullname, ...opts } = params;

    return this.notificationProvider.sendTemplateByEmail(
      {
        template,
        email,
        fullname,
        opts,
      },
      templateId ? { template: templateId } : null,
    );
  }
}
