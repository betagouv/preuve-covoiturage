import { Parents, Interfaces } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';

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
    // add queue handlers :)
    SendMailAction,
    SendTemplateMailAction,
  ];

  public async boot() {
    this.getContainer()
      .get(ConfigProviderInterfaceResolver)
      .loadConfigDirectory(__dirname);
    await super.boot();
  }
}
