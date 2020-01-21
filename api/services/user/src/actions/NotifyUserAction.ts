import { Action as AbstractAction } from '@ilos/core';
import { ContextType, handler } from '@ilos/common';
import { NotificationInterfaceResolver } from '@pdc/provider-notification';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/user/notify.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';

/*
 * Send email to user
 */
@handler(handlerConfig)
export class NotifyUserAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['channel.service.except', ['proxy']]];

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
