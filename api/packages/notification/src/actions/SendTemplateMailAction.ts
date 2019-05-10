import { Parents, Container, Providers } from '@pdc/core';

import { MailjetProvider } from '../providers/MailjetProvider';
import { HandlebarsProvider } from '../providers/HandlebarsProvider';
import { SendTemplateMailParamsInterface } from '../interfaces/SendTemplateMailParamsInterface';

@Container.handler({
  service: 'notification',
  method: 'sendtemplatemail',
})
export class SendTemplateMailAction extends Parents.Action {
  constructor(
    private mj: MailjetProvider,
    private hds: HandlebarsProvider,
    private conf: Providers.ConfigProvider,
  ) {
    super();
  }
  protected async handle(params: SendTemplateMailParamsInterface):Promise<void> {
    const { template, email, fullname, opts } = params;

    let { subject, title } = this.hds.getMetadata(template);

    if (!subject) {
      subject = this.conf.get('template.defaultSubject');
    }

    if (!title) {
      title = subject;
    }
    const content = this.hds.get(template, { email, fullname, subject, ...opts });

    this.mj.send({
      email,
      fullname,
      subject,
      content: {
        title,
        content,
      },
    });

    return;
  }
}
