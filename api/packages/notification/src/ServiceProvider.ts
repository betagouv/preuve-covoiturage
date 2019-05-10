import { Parents } from '@pdc/core';

import { SendMailAction } from './actions/SendMailAction';
import { SendTemplateMailAction } from './actions/SendTemplateMailAction';
import { MailjetProvider } from './providers/MailjetProvider';
import { HandlebarsProvider } from './providers/HandlebarsProvider';

export class ServiceProvider extends Parents.ServiceProvider {
  readonly alias = [
    MailjetProvider,
    HandlebarsProvider,
  ];

  handlers = [
    SendMailAction,
    SendTemplateMailAction,
  ];
}
