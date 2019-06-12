import { Interfaces } from '@ilos/core';

import { MailInterface } from './MailInterface';

export interface MailProviderInterface extends Interfaces.ProviderInterface {
  send(mail: MailInterface): Promise<void>;
}

export abstract class MailProviderInterfaceResolver {
  async send(mail: MailInterface): Promise<void> {
    throw new Error();
  }
}
