import { ConfigInterfaceResolver, NewableType, provider, TemplateInterfaceResolver } from '@ilos/common';

import { MailjetDriver } from './mail/MailjetDriver';
import {
  MailDriverInterface,
  MailInterface,
  NotificationConfigurationType,
  NotificationInterface,
  NotificationInterfaceResolver,
  TemplateMailInterface,
} from './common';

@provider({
  identifier: NotificationInterfaceResolver,
})
export class Notification implements NotificationInterface {
  protected config: NotificationConfigurationType;
  protected mailDriver: MailDriverInterface;
  protected mailDrivers: { [key: string]: NewableType<MailDriverInterface> } = {
    mailjet: MailjetDriver,
  };

  constructor(protected configProvider: ConfigInterfaceResolver, protected template: TemplateInterfaceResolver) {
    //
  }

  async init(): Promise<void> {
    this.config = this.configProvider.get('notification');
    this.registerMailDriver();
  }

  protected registerMailDriver(): void {
    if (!(this.config.mail.driver in this.mailDrivers)) {
      throw new Error(`Mail driver ${this.config.mail.driver} not found`);
    }

    this.mailDriver = new this.mailDrivers[this.config.mail.driver](
      {
        debug: this.config.mail.debug,
        from: this.config.mail.from,
        defaultSubject: this.config.mail.defaultSubject,
      },
      this.config.mail.driverOptions,
    );
  }

  async sendByEmail(mail: MailInterface, sendOptions: { [key: string]: any } = {}): Promise<void> {
    // override the to: address when 'debug' is set in the config
    // use: APP_MAILJET_DEBUG_NAME and APP_MAILJET_DEBUG_EMAIL env vars
    if ('debug' in this.config.mail && this.config.mail.debug) {
      mail.email = this.config.mail.to.email;
      mail.fullname = this.config.mail.to.name;
    }

    return this.mailDriver.send(mail, { ...this.config.mail.sendOptions, ...sendOptions });
  }

  async sendTemplateByEmail(mail: TemplateMailInterface, sendOptions?: { [key: string]: any }): Promise<void> {
    const { template, email, fullname, opts } = mail;

    // Get the subject from the config/template.ts file
    // in the calling service (e.g. service-user)
    // fallback the default subject configures in config/notification.ts
    // TODO: consolidate config files
    let subject;
    try {
      const meta = this.template.getMetadata(template);
      subject = meta.subject;
    } catch (e) {
      subject = this.config.mail.defaultSubject;
    }

    const content = this.template.get(template, { email, fullname, subject, ...opts });

    return this.sendByEmail(
      {
        email,
        fullname,
        subject,
        content,
      },
      sendOptions,
    );
  }
}
