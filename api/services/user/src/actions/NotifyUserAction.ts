import { get } from 'lodash';
import { Action as AbstractAction } from '@ilos/core';
import { ContextType, ForbiddenException, handler, TemplateMailInterface } from '@ilos/common';
import { NotificationInterfaceResolver } from '@pdc/provider-notification';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/user/notify.contract';

/*
 * Send email to user
 */
@handler(handlerConfig)
export class NotifyUserAction extends AbstractAction {
  // TODO middlewares (see below in handle())

  constructor(private notificationProvider: NotificationInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    // TODO replace this with a proper middleware
    if (get(context, 'channel.service', '') !== 'user') {
      throw new ForbiddenException();
    }

    const { templateId, template, email, fullname, ...opts } = params;

    return this.notificationProvider.sendTemplateByEmail(
      {
        template,
        email,
        fullname,
        opts,
      },
      templateId ? { templateId } : null,
    );
  }
}
