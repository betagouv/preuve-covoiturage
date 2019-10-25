import { InitHookInterface } from '@ilos/common';
import { MailInterface, TemplateMailInterface } from './MailDriverInterface';

interface ProviderInterface {}

export interface NotificationInterface extends ProviderInterface, InitHookInterface {
  sendByEmail(mail: MailInterface): Promise<void>;
  sendTemplateByEmail(mail: TemplateMailInterface): Promise<void>;
}

export abstract class NotificationInterfaceResolver implements NotificationInterface {
  async init() {
    return;
  }

  async sendByEmail(mail: MailInterface, sendOptions?: { [key: string]: any }): Promise<void> {
    throw new Error();
  }

  async sendTemplateByEmail(mail: TemplateMailInterface, sendOptions?: { [key: string]: any }): Promise<void> {
    throw new Error();
  }
}
