import { Parents, Container, Types, Interfaces } from '@ilos/core';

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
    private kernel: Interfaces.KernelInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: UserNotifyParamsInterface, context: Types.ContextType): Promise<void> {
    const requester = new User(context.call.user);

    // todo: waiting for notification provider
    // await this.kernel.notify(
    //   'notification:sendtemplatemail',
    //   {
    //     template: params.template,
    //     email: params.email,
    //     fullName: params.fullname,
    //     opts: {
    //       requester: requester.fullname,
    //       organization: params.organization,
    //       link: params.link,
    //     },
    //   },
    //   {
    //     call: context.call,
    //     channel: {
    //       ...context.channel,
    //       service: 'user',
    //     },
    //   },
    // );

    return;
  }
}
