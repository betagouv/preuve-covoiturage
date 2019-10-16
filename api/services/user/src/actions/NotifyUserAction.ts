import { get } from 'lodash';
import { Action as AbstractAction } from '@ilos/core';
import { ContextType, ForbiddenException, handler, NotificationInterfaceResolver } from '@ilos/common';
import { UserNotifyParamsInterface } from '@pdc/provider-schema';

import { SendTemplateByEmailParamsInterface } from '../interfaces/SendTemplateByEmailParamsInterface';

/*
 * Send email to user
 */
@handler({
  service: 'user',
  method: 'notify',
})
export class NotifyUserAction extends AbstractAction {
  // TODO middlewares (see below in handle())

  constructor(private notificationProvider: NotificationInterfaceResolver) {
    super();
  }

  public async handle(params: UserNotifyParamsInterface, context: ContextType): Promise<void> {
    // TODO replace this with a proper middleware
    if (get(context, 'channel.service', '') !== 'user') {
      throw new ForbiddenException();
    }

    const sendTemplateByEmailParams: SendTemplateByEmailParamsInterface = {
      template: params.template,
      email: params.email,
      fullname: params.fullname,
      opts: {},
    };

    if ('organization' in params) {
      sendTemplateByEmailParams.opts.organization = params.organization;
    }

    if ('link' in params) {
      sendTemplateByEmailParams.opts.link = params.link;
    }

    return this.notificationProvider.sendTemplateByEmail(
      {
        template: params.template,
        email: params.email,
        fullname: params.fullname,
        opts: {
          organization: params.organization,
          link: params.link,
        },
      },
      params.templateId ? { template: params.templateId } : null,
    );
  }
}
