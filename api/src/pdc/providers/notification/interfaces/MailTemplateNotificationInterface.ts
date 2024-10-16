import { StaticTemplateInterface } from "@/pdc/providers/template/index.ts";

export interface MailTemplateNotificationInterface<Data = any> {
  readonly data: Partial<Data>;
  readonly to: string;
}

export interface StaticMailTemplateNotificationInterface<Data = any> {
  readonly subject: string;
  readonly templateMJML?: StaticTemplateInterface<Data>;
  readonly templateText: StaticTemplateInterface<Data>;
  new (
    to: string,
    data: Partial<Data>,
  ): MailTemplateNotificationInterface<Data>;
}
