import { ConfigInterfaceResolver, handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { hasPermissionMiddleware } from '@pdc/provider-middleware';
import { NotificationInterfaceResolver } from '@pdc/provider-notification';

import { alias } from '../shared/user/contactform.schema';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/user/contactform.contract';

@handler({
  ...handlerConfig,
  middlewares: [['validate', alias], hasPermissionMiddleware('common.user.contactform')],
})
export class ContactformAction extends AbstractAction {
  constructor(private config: ConfigInterfaceResolver, private notify: NotificationInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    const content = `
email: ${params.email ?? '-'}<br/>
name: ${params.name ?? '-'}<br/>
company: ${params.company ?? '-'}<br/>
job: ${params.job ?? '-'}<br/><br/>
subject: <strong>${params.subject ?? '-'}</strong><br/>
<br/>
${params.body}
    `;

    await this.notify.sendByEmail({
      email: this.config.get('contactform.to'),
      fullname: 'rpc(contactform)',
      subject: 'Formulaire de contact',
      content,
    });
  }
}
