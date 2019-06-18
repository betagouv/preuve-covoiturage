import { Parents, Container, Types, Interfaces } from '@ilos/core';
import { NotificationProviderInterfaceResolver } from '@ilos/provider-notification';

import { User } from '../entities/User';
import { UserNotifyParamsInterface } from '../interfaces/actions/UserNotifyParamsInterface';

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
    const requester = new User(context.call.user);

    this.notificationProvider.sendTemplateByEmail({
      template: params.template,
      email: params.email,
      fullname: params.fullname,
      opts: {
        requester: requester.fullname,
        organization: params.organization,
        link: params.link,
      },
    });

    return;
  }
}
