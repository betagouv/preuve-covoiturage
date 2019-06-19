import { Parents, Container, Types, Interfaces } from '@ilos/core';
import { NotificationProviderInterfaceResolver } from '@ilos/provider-notification';

import { UserNotifyParamsInterface } from '../interfaces/actions/UserNotifyParamsInterface';
import { SendTemplateByEmailParamsInterface } from '../interfaces/SendTemplateByEmailParamsInterface';

/*
 * Send email to user
 */
@Container.handler({
  service: 'user',
  method: 'notify',
})
export class NotifyUserAction extends Parents.Action {
  constructor(
    private notificationProvider: NotificationProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: UserNotifyParamsInterface, context: Types.ContextType): Promise<void> {
    const sendTemplateByEmailParams:SendTemplateByEmailParamsInterface = {
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

    this.notificationProvider.sendTemplateByEmail({
      template: params.template,
      email: params.email,
      fullname: params.fullname,
      opts: {
        organization: params.organization,
        link: params.link,
      },
    });

    return;
  }
}
