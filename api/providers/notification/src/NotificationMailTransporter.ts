import { ConfigInterfaceResolver, provider } from '@ilos/common';
import { TemplateInterface, TemplateProviderInterfaceResolver } from '@pdc/provider-template';
import { createTransport, Transporter } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import mjml2html from 'mjml';

import {
  NotificationTransporterInterface,
  NotificationTransporterInterfaceResolver,
  MailTemplateNotificationInterface,
  StaticMailTemplateNotificationInterface,
} from './interfaces';

interface NotificationOptions {
  debug: boolean;
  debugToOverride: string;
  from: string;
}

@provider({
  identifier: NotificationTransporterInterfaceResolver,
})
export class NotificationMailTransporter
  implements NotificationTransporterInterface<MailTemplateNotificationInterface, Partial<Mail.Options>> {
  transporter: Transporter;
  protected options: NotificationOptions;

  constructor(
    protected config: ConfigInterfaceResolver,
    protected templateProvider: TemplateProviderInterfaceResolver,
  ) {}

  async init(): Promise<void> {
    this.setOptionsFromConfig();
    await this.createTransport();
  }

  async destroy(): Promise<void> {
    if (this.transporter) {
      this.transporter.close();
    }
  }

  protected setOptionsFromConfig(): void {
    this.options = {
      from: `${this.config.get('notification.mail.from.name')} <${this.config.get('notification.mail.from.email')}>`,
      debug: this.config.get('notification.mail.debug', false),
      debugToOverride: `${this.config.get('notification.mail.to.name')} <${this.config.get(
        'notification.mail.to.email',
      )}>`,
    };
  }

  protected async createTransport(verify = true): Promise<void> {
    if (!this.transporter) {
      this.transporter = createTransport(this.config.get('notification.mail.smtp'));
      if (verify) {
        await this.transporter.verify();
      }
    }
  }

  protected render(template: TemplateInterface, mjml = false): string {
    const result = this.templateProvider.render(template);
    return !mjml ? result : mjml2html(result).html;
  }

  async send(mail: MailTemplateNotificationInterface, options = {}): Promise<void> {
    const mailCtor = mail.constructor as StaticMailTemplateNotificationInterface;

    await this.transporter.sendMail({
      ...options,
      from: this.options.from,
      to: this.options.debug ? this.options.debugToOverride : mail.to,
      subject: mailCtor.subject,
      html: mailCtor.templateMJML ? this.render(new mailCtor.templateMJML(mail.data), true) : undefined,
      text: this.render(new mailCtor.templateText(mail.data)),
    });

    return;
  }
}
