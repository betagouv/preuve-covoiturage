import {
  ConfigInterfaceResolver,
  RegisterHookInterface,
  InitHookInterface,
  ServiceContainerInterface,
  extension,
} from '@ilos/common';

import { ConfigExtension } from '@ilos/config';

import { TemplateExtension, TemplateInterfaceResolver } from '@pdc/provider-template';

import { NotificationInterfaceResolver } from './interfaces';
import { Notification } from './Notification';

@extension({
  name: 'notification',
  require: [ConfigExtension, TemplateExtension],
  override: true,
})
export class NotificationExtension implements RegisterHookInterface, InitHookInterface {
  static readonly key: string = 'notification';

  constructor(
    protected config?: {
      template: string;
      templateMeta: string | { [k: string]: any };
    },
  ) {}

  register(serviceContainer: ServiceContainerInterface): void {
    serviceContainer.bind(Notification);
    serviceContainer.registerHooks(Notification.prototype, NotificationInterfaceResolver);
  }

  async init(serviceContainer: ServiceContainerInterface): Promise<void> {
    if (this.config) {
      const container = serviceContainer.getContainer();

      if (!container.isBound(TemplateInterfaceResolver)) {
        throw new Error('Unable to find template provider');
      }

      if (!container.isBound(ConfigInterfaceResolver)) {
        throw new Error('Unable to find config provider');
      }

      container
        .get(TemplateInterfaceResolver)
        .loadTemplatesFromDirectory(
          this.config.template,
          typeof this.config.templateMeta === 'string'
            ? container.get(ConfigInterfaceResolver).get(this.config.templateMeta)
            : this.config.templateMeta,
        );
    }
  }
}
