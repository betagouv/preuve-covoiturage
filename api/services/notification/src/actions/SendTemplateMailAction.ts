import { Parents, Container, Providers } from '@pdc/core';

import { HandlebarsProvider } from '../providers/HandlebarsProvider';
import { SendTemplateMailParamsInterface } from '../interfaces/SendTemplateMailParamsInterface';
import { MailProviderInterfaceResolver } from '../interfaces/MailProviderInterface';
import { TemplateProviderInterfaceResolver } from '../interfaces/TemplateProviderInterface';

@Container.handler({
  service: 'notification',
  method: 'sendtemplatemail',
})
export class SendTemplateMailAction extends Parents.Action {
  constructor(
    private ml: MailProviderInterfaceResolver,
    private template: TemplateProviderInterfaceResolver,
    private conf: Providers.ConfigProvider,
  ) {
    super();
  }
  protected async handle(params: SendTemplateMailParamsInterface):Promise<void> {
    const { template, email, fullname, opts } = params;

    let { subject, title } = this.template.getMetadata(template);

    if (!subject) {
      subject = this.conf.get('template.defaultSubject');
    }

    if (!title) {
      title = subject;
    }
    const content = this.template.get(template, { email, fullname, subject, ...opts });
    this.ml.send({
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
