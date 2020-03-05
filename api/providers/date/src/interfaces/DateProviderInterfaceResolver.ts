import { ProviderInterface } from '@ilos/common';

export interface DateProviderInterface extends ProviderInterface {
  format(date: Date, formatStr: string): string;
}

export abstract class DateProviderInterfaceResolver implements DateProviderInterface {
  format(date: Date, formatStr = 'PP'): string {
    throw new Error('Method not implemented.');
  }
}
