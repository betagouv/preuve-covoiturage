import { get } from 'lodash';
import { Action as AbstractAction } from '@ilos/core';
import { ContextType, ForbiddenException, handler } from '@ilos/common';
import { NotificationInterfaceResolver } from '@pdc/provider-notification';

import { configHandler, ParamsInterface, ResultInterface } from '../shared/user/notify.contract';
import { SendTemplateByEmailParamsInterface } from '../shared/user/common/interfaces/SendTemplateByEmailParamsInterface';

/*
 * Send email to user
 */
@handler(configHandler)
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
