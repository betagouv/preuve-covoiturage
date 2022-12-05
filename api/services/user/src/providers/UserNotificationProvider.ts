import { ConfigInterfaceResolver, KernelInterfaceResolver, ContextType, provider } from '@ilos/common';

import {
  MailTemplateNotificationInterface,
  NotificationTransporterInterfaceResolver,
  StaticMailTemplateNotificationInterface,
} from '@pdc/provider-notification';

import {
  ConfirmEmailNotification,
  ContactFormNotification,
  EmailUpdatedNotification,
  ExportCSVErrorNotification,
  ExportCSVNotification,
  ForgottenPasswordNotification,
  InviteNotification,
  SimulatePolicyNotification,
} from '../notifications';
import { ParamsInterface as SimulationPolicyParamsInterface } from '../shared/user/simulatePolicyform.contract';
import { ResultInterface as SimulateOnPastResult } from '../shared/policy/simulateOnPastGeo.contract';
import { PolicyTemplateDescriptions } from '../shared/policy/common/classes/PolicyTemplateDescription';

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
      ConfirmEmailNotification: ConfirmEmailNotification,
      ContactFormNotification: ContactFormNotification,
      EmailUpdatedNotification: EmailUpdatedNotification,
      ExportCSVErrorNotification: ExportCSVErrorNotification,
      ExportCSVNotification: ExportCSVNotification,
      ForgottenPasswordNotification: ForgottenPasswordNotification,
      InviteNotification: InviteNotification,
      SimulatePolicyNotification: SimulatePolicyNotification,
    }),
  );

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
    if (process.env.NODE_ENV === 'local') {
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
      const notification = new notificationCtor(data.to, data.data);
      await this.notificationTransporter.send(notification);
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
        action_href: link,
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
        action_href: link,
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
        action_href: link,
      },
    });
  }

  async simulationEmail(
    formParams: SimulationPolicyParamsInterface,
    simulationResult: { [key: number]: SimulateOnPastResult },
  ): Promise<void> {
    const template = 'SimulatePolicyNotification';
    this.log('SimulatePolicyNotification form', formParams.email, null, null);
    await this.queueEmail({
      template,
      to: `${this.getTo(formParams.email, `${formParams.firstname} ${formParams.name}`)}, ${this.config.get(
        'contactform.to',
      )}`,
      data: {
        simulation_policy_description_html: PolicyTemplateDescriptions.get[formParams.simulation.policy_template_id],
        simulation_territory_name: formParams.territory_name,
        simulation_form_email: formParams.email,
        simulation_form_fullname: `${formParams.firstname} ${formParams.name}`,
        simulation_form_job: formParams.job,
        simulation_form_simulation_param: formParams.simulation,

        simulation_result_one_month_trip_subsidized: simulationResult['1'].trip_subsidized,
        simulation_result_one_month_amount: simulationResult['1'].amount / 100,

        simulation_result_three_months_trip_subsidized: simulationResult['3'].trip_subsidized,
        simulation_result_three_months_amount: simulationResult['3'].amount / 100,

        simulation_result_six_months_trip_subsidized: simulationResult['6'].trip_subsidized,
        simulation_result_six_months_amount: simulationResult['6'].amount / 100,
      },
    });
  }

  /**
   * Send contactForm notification
   */
  async contactForm(data: {
    body: string;
    email: string;
    name?: string;
    company?: string;
    subject?: string;
  }): Promise<void> {
    const template = 'ContactFormNotification';
    this.log('Contact form', data.email, null, null);
    await this.queueEmail({
      template,
      to: this.config.get('contactform.to'),
      data: {
        contact_form_email: data.email,
        contact_form_message: data.body,
        contact_form_name: data.name ?? 'Sans nom',
        contact_form_company: data.company ?? 'non précisé',
      },
    });
  }
}
