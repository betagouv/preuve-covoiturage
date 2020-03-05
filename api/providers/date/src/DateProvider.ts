import { format } from 'date-fns';
import fr from 'date-fns/locale/fr';
import { provider } from '@ilos/common';

import { DateProviderInterface, DateProviderInterfaceResolver } from './interfaces/DateProviderInterfaceResolver';

/**
 * date-fns wrappers to handle i18n
 * https://date-fns.org/v2.9.0/docs/I18n
 */

@provider({
  identifier: DateProviderInterfaceResolver,
})
export class DateProvider implements DateProviderInterface {
  format(date: Date, formatStr = 'PP'): string {
    return format(date, formatStr, { locale: fr });
  }
}
