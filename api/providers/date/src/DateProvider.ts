import { format } from 'date-fns';
import fr from 'date-fns/locale/fr';

import { DateProviderInterface } from './interfaces/DateProviderInterfaceResolver';

/**
 * date-fns wrappers to handle i18n
 * https://date-fns.org/v2.9.0/docs/I18n
 */

export class DateProvider implements DateProviderInterface {
  format(date: Date, formatStr = 'PP'): string {
    return format(date, formatStr, { locale: fr });
  }
}
