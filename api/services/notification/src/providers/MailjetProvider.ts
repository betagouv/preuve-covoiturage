import { Providers, Container } from '@pdc/core';
import { MailProviderInterface } from '../interfaces/MailProviderInterface';
import nodeMailjet from 'node-mailjet';

import { MailInterface } from '../interfaces/MailInterface';

@Container.provider()
export class MailjetProvider implements MailProviderInterface {
  protected mj;
  protected config;

  constructor(private configProvider: Providers.ConfigProvider) {}
  async boot(): Promise<void> {
    const mailjetConfig = this.configProvider.get('mail.mailjetConfig');
    this.config = this.configProvider.get('mail.mailjet');
    this.mj = nodeMailjet.connect(
      this.config.public,
      this.config.private,
      mailjetConfig,
    );
  }

  async send(mail: MailInterface): Promise<void> {
    const { email, fullname, subject, content: { title, content: fullContent } } = mail;
    this.mj
      .post('send')
      .request({
        Messages: [
          {
            From: {
              Email: this.config.email,
              Name: this.config.name,
            },
            To: [
              {
                Email: this.config.debug_email || email,
                Name: this.config.debug_fullname || fullname,
              },
            ],
            TemplateID: parseInt(this.config.template, 10),
            TemplateLanguage: true,
            Subject: subject,
            Variables: {
              title,
              content: fullContent,
            },
          },
        ],
      });
  }
}
