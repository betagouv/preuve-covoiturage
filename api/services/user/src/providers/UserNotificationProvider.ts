import { sprintf } from 'sprintf-js';
import { ConfigInterfaceResolver, KernelInterfaceResolver, ContextType, provider } from '@ilos/common';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { ParamsInterface as SendMailParamsInterface } from '../shared/user/notify.contract';

interface NotificationConfigInterface {
  url: string;
  template: string;
  templateId: string;
}

@provider()
export class UserNotificationProvider {
  public readonly INVITATION: NotificationConfigInterface;
  public readonly FORGOTTEN: NotificationConfigInterface;
  public readonly CONFIRMATION: NotificationConfigInterface;
  public readonly EMAIL_CHANGED: NotificationConfigInterface;
  public readonly defaultContext: ContextType = {
    call: { user: {} },
    channel: {
      service: 'user',
      transport: 'http',
    },
  };

  constructor(
    private config: ConfigInterfaceResolver,
    private kernel: KernelInterfaceResolver,
    private userRepository: UserRepositoryProviderInterfaceResolver,
    private logger = console,
  ) {
    this.INVITATION = {
      url: 'activate',
      template: config.get('email.templates.invitation'),
      templateId: config.get('notification.templateIds.invitation'),
    };

    this.FORGOTTEN = {
      url: 'reset-forgotten-password',
      template: config.get('email.templates.forgotten'),
      templateId: config.get('notification.templateIds.forgotten'),
    };

    this.CONFIRMATION = {
      url: 'confirm-email',
      template: config.get('email.templates.confirmation'),
      templateId: config.get('notification.templateIds.emailChange'),
    };

    this.EMAIL_CHANGED = {
      url: 'activate',
      template: config.get('email.templates.email_changed'),
      templateId: config.get('notification.templateIds.emailChange'),
    };
  }

  /**
   * Generate url from email and token
   */
  protected getUrl(path: string, email: string, token: string): string {
    return sprintf(
      '%s/%s/%s/%s/',
      this.config.get('url.appUrl'),
      path,
      encodeURIComponent(email),
      encodeURIComponent(token),
    );
  }

  /**
   * Log in testing env
   */
  protected log(message: string, email: string, token: string, link: string): void {
    if (process.env.NODE_ENV === 'testing') {
      this.logger.log(`
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
   * Send mail is a wrapper around user:notify
   */
  protected async sendMail(data: SendMailParamsInterface): Promise<void> {
    await this.kernel.notify('user:notify', data, this.defaultContext);
    return;
  }

  /**
   * Generate token and send forgotten password email
   */
  async passwordForgotten(token: string, email: string): Promise<void> {
    const { url, templateId } = this.FORGOTTEN;
    const link = this.getUrl(url, email, token);

    this.log('Forgotten Password', email, token, link);

    const user = await this.userRepository.findByEmail(email);

    await this.sendMail({
      link,
      email,
      templateId,
      template: this.config.get('email.templates.forgotten'),
      fullname: `${user.firstname} ${user.lastname}`,
    });

    return;
  }

  /**
   * Generate a confirmation token and notify the new and old email addresses about the email change
   */
  async emailUpdated(token: string, email: string, oldEmail?: string): Promise<void> {
    const { url, template, templateId } = this.CONFIRMATION;
    const { template: emailChangedTemplate, templateId: emailChangedTemplateId } = this.EMAIL_CHANGED;

    const link = this.getUrl(url, email, token);

    this.log(oldEmail ? 'Patch user' : 'Send confirm email to user', email, token, link);

    const user = await this.userRepository.findByEmail(email);

    // Notify the new email with a confirmation link
    await this.sendMail({
      link,
      email,
      template,
      templateId,
      fullname: `${user.firstname} ${user.lastname}`,
    });

    // Notify the previous email about the change
    if (oldEmail) {
      await this.sendMail({
        template: emailChangedTemplate,
        templateId: emailChangedTemplateId,
        email: oldEmail,
        fullname: `${user.firstname} ${user.lastname}`,
      });
    }
  }

  /**
   * Generate confirmation token and send welcome mail
   */
  async userCreated(token: string, email: string): Promise<void> {
    const { url, template, templateId } = this.CONFIRMATION;

    const user = await this.userRepository.findByEmail(email);

    const link = this.getUrl(url, user.email, token);
    this.log('Create user', user.email, token, link);
    await this.sendMail({
      link,
      email,
      template,
      templateId,
      fullname: `${user.firstname} ${user.lastname}`,
    });
  }
}
