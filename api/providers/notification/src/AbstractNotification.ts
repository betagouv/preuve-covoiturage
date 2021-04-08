import { StaticTemplateInterface, TemplateInterface } from '@pdc/provider-template';
import { MailTemplateNotificationInterface } from './interfaces';

export abstract class AbstractMailNotification<Data = any> implements MailTemplateNotificationInterface<Data> {
    static readonly templateText: StaticTemplateInterface;
    static readonly templateMJML: StaticTemplateInterface;
    static readonly subject: string;

    constructor(
        public readonly to: string,
        public readonly data: Partial<Data>,
    ) {}
}
