export interface MailInterface {
  email: string;
  fullname: string;
  subject: string;
  content: any;
}

export interface TemplateMailInterface {
  email: string;
  fullname: string;
  template: string;
  opts: any;
}

export interface MailDriverInterface {
  send(mail: MailInterface, opts?: { [key: string]: any }): Promise<void>;
}
