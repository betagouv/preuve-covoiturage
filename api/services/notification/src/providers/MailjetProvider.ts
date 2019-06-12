import nodeMailjet from 'node-mailjet';
import { Container } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';

import { MailProviderInterface } from '../interfaces/MailProviderInterface';
import { MailInterface } from '../interfaces/MailInterface';
import { MailjetConfigInterface, MailjetConnectOptionsInterface } from '../interfaces/MailjetInterface';

@Container.provider()
export class MailjetProvider implements MailProviderInterface {
  protected mj: nodeMailjet.Email.Client;
  protected config: MailjetConfigInterface;

  constructor(private configProvider: ConfigProviderInterfaceResolver) {}
  async boot(): Promise<void> {
    const connectOptions: MailjetConnectOptionsInterface = this.configProvider.get('mail.connectOptions');
    this.config = this.configProvider.get('mail.mailjet');
    this.mj = nodeMailjet.connect(this.config.public, this.config.private, connectOptions);
  }

  async send(mail: MailInterface): Promise<void> {
    const {
      email,
      fullname,
      subject,
      content: { title, content: fullContent },
    } = mail;

    this.mj.post('send').request({
      Messages: [
        {
          From: {
            Email: this.config.email,
            Name: this.config.name,
          },
          To: [
            {
              Email: this.config.debugEmail || email,
              Name: this.config.debugFullname || fullname,
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
