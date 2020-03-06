import { InitHookInterface } from '@ilos/common';

import { MailInterface, TemplateMailInterface } from './MailDriverInterface';

export interface NotificationInterface extends InitHookInterface {
  sendByEmail(mail: MailInterface, sendOptions?: { [key: string]: any }): Promise<void>;
  sendTemplateByEmail(mail: TemplateMailInterface, sendOptions?: { [key: string]: any }): Promise<void>;
}

export abstract class NotificationInterfaceResolver implements NotificationInterface {
  async init(): Promise<void> {
    return;
  }

  async sendByEmail(mail: MailInterface, sendOptions?: { [key: string]: any }): Promise<void> {
    throw new Error();
  }

  async sendTemplateByEmail(mail: TemplateMailInterface, sendOptions?: { [key: string]: any }): Promise<void> {
    throw new Error();
  }
}
