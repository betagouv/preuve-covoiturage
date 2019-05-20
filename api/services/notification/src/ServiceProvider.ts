import { Parents, Providers, Interfaces } from '@pdc/core';

import { SendMailAction } from './actions/SendMailAction';
import { SendTemplateMailAction } from './actions/SendTemplateMailAction';
import { MailjetProvider } from './providers/MailjetProvider';
import { HandlebarsProvider } from './providers/HandlebarsProvider';
import { MailProviderInterfaceResolver } from './interfaces/MailProviderInterface';
import { TemplateProviderInterfaceResolver } from './interfaces/TemplateProviderInterface';

export class ServiceProvider extends Parents.ServiceProvider implements Interfaces.ServiceProviderInterface {
  readonly alias = [
    [MailProviderInterfaceResolver, MailjetProvider],
    [TemplateProviderInterfaceResolver, HandlebarsProvider],
  ];

  handlers = [
    SendMailAction,
    SendTemplateMailAction,
  ];

  public async boot() {
    this.getContainer().get(Providers.ConfigProvider).loadConfigDirectory(__dirname);
    await super.boot();
  }
}
