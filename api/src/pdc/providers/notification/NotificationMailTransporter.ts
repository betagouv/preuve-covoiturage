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
  transporter: mailer.Transporter | null = null;
  protected options: NotificationOptions = {} as NotificationOptions;

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
    const fromFullname = this.config.get("notification.mail.from.name");
    const fromEmail = this.config.get("notification.mail.from.email");
    const toFullname = this.config.get("notification.mail.to.name");
    const toEmail = this.config.get("notification.mail.to.email");
    const debug = this.config.get("notification.mail.debug", false);

    this.options = {
      from: `${fromFullname} <${fromEmail}>`,
      debugToOverride: `${toFullname} <${toEmail}>`,
      debug,
    };
  }

  protected async createTransport(verify = false): Promise<void> {
    if (!this.transporter) {
      const smtp = this.config.get("notification.mail.smtp");
      this.transporter = mailer.createTransport(smtp);
      if (verify) {
        try {
          await this.transporter.verify();
        } catch (e) {
          logger.error("Failed to connect to SMTP server", e.message);
          exit(1);
        }
      }
    }
  }

  protected render(template: TemplateInterface, mjml = false): string {
    const result = this.templateProvider.render(template);
    return !mjml ? result : mjml2html(result).html;
  }

  protected moustache(str: string, data: Record<string, unknown>): string {
    return str.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
      return data[key.trim()] as string;
    });
  }

  async send(
    mail: MailTemplateNotificationInterface,
    options = {},
  ): Promise<void> {
    const mailCtor = mail
      .constructor as StaticMailTemplateNotificationInterface;

    if (
      "message_html" in mail.data && typeof mail.data.message_html === "string"
    ) {
      mail.data.message_html = this.moustache(
        mail.data.message_html,
        mail.data,
      );
    }

    if (
      "message_text" in mail.data && typeof mail.data.message_text === "string"
    ) {
      mail.data.message_text = this.moustache(
        mail.data.message_text,
        mail.data,
      );
    }

    this.transporter && await this.transporter.sendMail({
      ...options,
      from: this.options.from,
      to: this.options.debug ? this.options.debugToOverride : mail.to,
      subject: mailCtor.subject,
      html: mailCtor.templateMJML
        ? this.render(new mailCtor.templateMJML(mail.data), true)
        : undefined,
      text: this.render(new mailCtor.templateText(mail.data)),
    });
  }
}
