import { Locale } from 'date-fns';
import { ProviderInterface } from '@ilos/common';

export interface FormatOptionsInterface {
  locale: Locale;
  timeZone: string;
}

export interface DateProviderInterface extends ProviderInterface {
  format(date: Date, formatStr: string, options: Partial<FormatOptionsInterface>): string;
}

export abstract class DateProviderInterfaceResolver implements DateProviderInterface {
  format(date: Date, formatStr = 'PP', options: Partial<FormatOptionsInterface> = {}): string {
    throw new Error('Method not implemented.');
  }
}
