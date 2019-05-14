import { Parents, Container } from '@pdc/core';

import { MailjetProvider } from '../providers/MailjetProvider';
import { SendMailParamsInterface } from '../interfaces/SendMailParamsInterface';

@Container.handler({
  service: 'notification',
  method: 'sendmail',
})
export class SendMailAction extends Parents.Action {
  constructor(
    private mj: MailjetProvider,
  ) {
    super();
  }

  protected async handle(params: SendMailParamsInterface): Promise<void> {
    this.mj.send({
      ...params,
      content: {
        title: params.subject,
        content: params.content,
      },
    });
    return;
  }
}
