import { Parents, Container } from '@pdc/core';

import { SendMailParamsInterface } from '../interfaces/SendMailParamsInterface';
import { MailProviderInterfaceResolver } from '../interfaces/MailProviderInterface';

@Container.handler({
  service: 'notification',
  method: 'sendmail',
})
export class SendMailAction extends Parents.Action {
  constructor(
    private ml: MailProviderInterfaceResolver,
  ) {
    super();
  }

  protected async handle(params: SendMailParamsInterface): Promise<void> {
    this.ml.send({
      ...params,
      content: {
        title: params.subject,
        content: params.content,
      },
    });
    return;
  }
}
