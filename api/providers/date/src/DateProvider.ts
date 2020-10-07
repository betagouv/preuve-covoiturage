import { utcToZonedTime, format } from 'date-fns-tz';
import fr from 'date-fns/locale/fr';
import { provider } from '@ilos/common';

import {
  FormatOptionsInterface,
  DateProviderInterface,
  DateProviderInterfaceResolver,
} from './interfaces/DateProviderInterfaceResolver';

/**
 * date-fns wrappers to handle i18n
 * https://date-fns.org/v2.9.0/docs/I18n
 */

@provider({
  identifier: DateProviderInterfaceResolver,
})
export class DateProvider implements DateProviderInterface {
  format(date: Date, formatStr = 'PP', options: Partial<FormatOptionsInterface> = {}): string {
    const opt = {
      locale: fr,
      timeZone: 'UTC',
      ...options,
    };

    return format(utcToZonedTime(date, opt.timeZone), formatStr, opt);
  }
}
