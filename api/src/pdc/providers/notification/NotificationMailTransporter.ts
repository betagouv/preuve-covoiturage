import { mailer, MailOptions, mjml2html } from "@/deps.ts";
import { ConfigInterfaceResolver, provider } from "@/ilos/common/index.ts";
import {
  TemplateInterface,
  TemplateProviderInterfaceResolver,
} from "@/pdc/providers/template/index.ts";

import { logger } from "@/lib/logger/index.ts";
import { exit } from "@/lib/process/index.ts";
import {
  MailTemplateNotificationInterface,
  NotificationTransporterInterface,
  NotificationTransporterInterfaceResolver,
  StaticMailTemplateNotificationInterface,
} from "./interfaces/index.ts";

interface NotificationOptions {
  debug: boolean;
  debugToOverride: string;
  from: string;
}

@provider({
  identifier: NotificationTransporterInterfaceResolver,
})
export class NotificationMailTransporter
  implements
    NotificationTransporterInterface<
      MailTemplateNotificationInterface,
      Partial<MailOptions>
    > {
  transporter: mailer.Transporter;
  protected options: NotificationOptions;

  constructor(
    protected config: ConfigInterfaceResolver,
    protected templateProvider: TemplateProviderInterfaceResolver,
  ) {}

  async init(): Promise<void> {
    this.setOptionsFromConfig();
    await this.createTransport(
      this.config.get("notification.mail.verifySmtp", false),
    );
  }

  async destroy(): Promise<void> {
    if (this.transporter) {
      this.transporter.close();
    }
  }

  protected setOptionsFromConfig(): void {
    this.options = {
      from: `${this.config.get("notification.mail.from.name")} <${
        this.config.get("notification.mail.from.email")
      }>`,
      debug: this.config.get("notification.mail.debug", false),
      debugToOverride: `${this.config.get("notification.mail.to.name")} <${
        this.config.get(
          "notification.mail.to.email",
        )
      }>`,
    };
  }

  protected async createTransport(verify = false): Promise<void> {
    if (!this.transporter) {
      this.transporter = mailer.createTransport(
        this.config.get("notification.mail.smtp"),
      );
      if (verify) {
        try {
          await this.transporter.verify();
        } catch (e) {
          logger.error("Failed to connect to SMTP server");
          exit(1);
        }
      }
    }
  }

  protected render(template: TemplateInterface, mjml = false): string {
    const result = this.templateProvider.render(template);
    return !mjml ? result : mjml2html(result).html;
  }

  async send(
    mail: MailTemplateNotificationInterface,
    options = {},
  ): Promise<void> {
    const mailCtor = mail
      .constructor as StaticMailTemplateNotificationInterface;

    await this.transporter.sendMail({
      ...options,
      from: this.options.from,
      to: this.options.debug ? this.options.debugToOverride : mail.to,
      subject: mailCtor.subject,
      html: mailCtor.templateMJML
        ? this.render(new mailCtor.templateMJML(mail.data), true)
        : undefined,
      text: this.render(new mailCtor.templateText(mail.data)),
    });

    return;
  }
}
