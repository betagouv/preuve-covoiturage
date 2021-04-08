import {
  ConfigInterfaceResolver,
  KernelInterfaceResolver,
  ContextType,
  provider,
} from '@ilos/common';

import { MailTemplateNotificationInterface, NotificationTransporterInterfaceResolver, StaticMailTemplateNotificationInterface } from '@pdc/provider-notification';

import {
  ConfirmEmailNotification, 
  EmailUpdatedNotification,
  ExportCSVErrorNotification,
  ExportCSVNotification,
  ForgottenPasswordNotification,
  InviteNotification,
} from '../notifications';

import { ParamsInterface as SendMailParamsInterface } from '../shared/user/notify.contract';

@provider()
export class UserNotificationProvider {
  public readonly urlPathMap: Map<string, string> = new Map<string, string>([
    ['InviteNotification', 'activate'],
    ['ForgottenPasswordNotification', 'reset-forgotten-password'],
    ['ConfirmEmailNotification', 'confirm-email'],
    ['EmailUpdatedNotification', 'activate'],
  ]);

  public readonly defaultContext: ContextType = {
    call: { user: {} },
    channel: {
      service: 'user',
      transport: 'http',
    },
  };

  protected notifications: Map<string, StaticMailTemplateNotificationInterface> = new Map(
    Object.entries({
    'ConfirmEmailNotification': ConfirmEmailNotification,
    'EmailUpdatedNotification': EmailUpdatedNotification,
    'ExportCSVErrorNotification': ExportCSVErrorNotification,
    'ExportCSVNotification': ExportCSVNotification,
    'ForgottenPasswordNotification': ForgottenPasswordNotification,
    'InviteNotification': InviteNotification,
  }));

  constructor(
    protected config: ConfigInterfaceResolver,
    protected kernel: KernelInterfaceResolver,
    protected notificationTransporter: NotificationTransporterInterfaceResolver<MailTemplateNotificationInterface>,
  ) {}

  /**
   * Generate url from email and token
   */
  protected getUrl(notification: string, email: string, token: string): string {
    const path = this.urlPathMap.get(notification);
    return [this.config.get('url.appUrl'), path, encodeURIComponent(email), encodeURIComponent(token)].join('/');
  }

  protected getTo(email: string, fullname: string): string {
    return `${fullname} <${email}>`;
  }

  /**
   * Log in testing env
   */
  protected log(message: string, email: string, token: string, link: string): void {
    if (process.env.NODE_ENV === 'testing') {
      console.info(`
******************************************
[test] ${message}
email: ${email}
token: ${token}
link:  ${link}
******************************************
      `);
    }
    return;
  }

  /**
   * Queue email by using user:notify
   */
  protected async queueEmail(data: SendMailParamsInterface): Promise<void> {
    await this.kernel.notify('user:notify', data, this.defaultContext);
  }

  async sendEmail(data: SendMailParamsInterface): Promise<void> {
    const notificationCtor = this.notifications.get(data.template);
    if (notificationCtor) {
      await this.notificationTransporter.send(
        new notificationCtor(data.to, data.data),
      );
    }
  }

  /**
   * Send password forgotten notification
   */
  async passwordForgotten(token: string, email: string, fullname: string): Promise<void> {
    const template = 'ForgottenPasswordNotification';
    const link = this.getUrl(template, email, token);
    this.log('Forgotten Password', email, token, link);

    await this.queueEmail({
      template,
      to: this.getTo(email, fullname),
      data: {
        fullname,
        action: {
          href: link,
        },
      },
    });
  }

  /**
   * Send email updated notifiation
   */
  async emailUpdated(token: string, email: string, oldEmail: string, fullname: string): Promise<void> {
    const template = 'EmailUpdatedNotification';
    this.log('Patch user', email, token, null);

    await this.queueEmail({
      template,
      to: this.getTo(oldEmail, fullname),
      data: {
        fullname,
      },
    });
    
    await this.confirmEmail(token, email, fullname);
  }

   /**
   * Send confirm email notification
   */
  async confirmEmail(token: string, email: string, fullname: string): Promise<void> {
    const template = 'ConfirmEmailNotification';
    const link = this.getUrl(template, email, token);
    this.log('Confirm email', email, token, link);

    await this.queueEmail({
      template,
      to: this.getTo(email, fullname),
      data: {
        fullname,
        action: {
          href: link,
        },
      },
    });
  }
  /**
   * Send invite notification
   */
  async invite(token: string, email: string, fullname: string): Promise<void> {
    const template = 'InviteNotification';
    const link = this.getUrl(template, email, token);
    this.log('Confirm email', email, token, link);

    await this.queueEmail({
      template,
      to: this.getTo(email, fullname),
      data: {
        fullname,
        action: {
          href: link,
        },
      },
    });
  }
}
