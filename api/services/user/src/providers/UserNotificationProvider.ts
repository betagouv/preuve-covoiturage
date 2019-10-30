import { sprintf } from 'sprintf-js';

import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { ConfigInterfaceResolver, KernelInterfaceResolver, ContextType, provider } from '@ilos/common';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';

@provider()
export class UserNotificationProvider {
  constructor(
    private cryptoProvider: CryptoProviderInterfaceResolver,
    private config: ConfigInterfaceResolver,
    private kernel: KernelInterfaceResolver,
    private userRepository: UserRepositoryProviderInterfaceResolver,
  ) {}

  /**
   * Generate url from email and token
   * @protected
   */
  protected getUrl(path: string, email: string, token: string) {
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
   * @protected
   */
  protected log(message: string, email: string, token: string, link: string) {
    if (process.env.NODE_ENV === 'testing') {
      console.log(`
******************************************
[test] ${message}
email: ${email}
token: ${token}
link:  ${link}
******************************************
      `);
    }
  }

  /**
   * Send mail is a wrapper around user:notify
   * @protected
   */
  protected async sendMail(data: { link: string; template: string; email: string; fullname: string }) {
    // TODO check this
    // generate a context if missing
    const ctx: ContextType = {
      call: { user: {} },
      channel: {
        service: 'user',
        transport: 'http',
      },
    };

    await this.kernel.notify('user:notify', data, ctx);
  }

  // protected async generateToken(_id: string, status?: string): Promise<string> {
  //   const forgotten_token = await this.cryptoProvider.cryptToken(this.cryptoProvider.generateToken());
  //   const patch: {
  //     forgotten_token: string;
  //     forgotten_at: Date;
  //     status?: string;
  //   } = {
  //     forgotten_token,
  //     forgotten_at: new Date(),
  //   };

  //   if (status) {
  //     patch.status = status; // demander au front
  //   }

  //   await this.userRepository.patch(_id, patch);

  //   return forgotten_token;
  // }

  /**
   * Generate token and send forgotten password email
   */
  async passwordForgotten(email, token) {
    const link = this.getUrl('reset-forgotten-password', email, token);

    this.log('Forgotten Password', email, token, link);

    const user = await this.userRepository.findByEmail(email);

    await this.sendMail({
      link,
      template: this.config.get('email.templates.forgotten'),
      email: email,
      fullname: `${user.firstname} ${user.lastname}`,
    });
  }

  /**
   * Generate a confirmation token and notify the new and old email addresses about the email change
   */
  async emailUpdated(token: string, email: string, oldEmail?: string) {
    const link = this.getUrl('confirm-email', email, token);

    this.log(oldEmail ? 'Patch user' : 'Send confirm email to user', email, token, link);

    const user = await this.userRepository.findByEmail(email);

    // Notify the new email with a confirmation link
    await this.sendMail({
      link,
      email,
      template: this.config.get('email.templates.confirmation'),
      fullname: `${user.firstname} ${user.lastname}`,
      // templateId: this.config.get('notification.templateIds.emailChange'), <- TODO fix me
    });

    // Notify the previous email about the change
    if (oldEmail) {
      // await this.sendMail({
      // <- TODO fix me missing link
      // template: this.config.get('email.templates.email_changed'),
      // email: oldEmail,
      // fullname: `${user.firstname} ${user.lastname}`,
      // templateId: this.config.get('notification.templateIds.emailChange'), <- TODO fix me
      // });
    }
  }

  /**
   * Generate confirmation token and send welcome mail
   */
  async userCreated(user, token) {
    // generate new token for a password reset on first access
    // const token = await this.generateToken(user._id);
    const link = this.getUrl('activate', user.email, token);
    this.log('Create user', user.email, token, link);
    await this.sendMail({
      link,
      template: this.config.get('email.templates.invitation'),
      email: user.email,
      fullname: `${user.firstname} ${user.lastname}`,
    });
  }
}
