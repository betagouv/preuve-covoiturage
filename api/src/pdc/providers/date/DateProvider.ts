import { datefr, format, FormatOptionsWithTZ, toZonedTime } from "@/deps.ts";
import { provider } from "@/ilos/common/index.ts";
import {
  DateProviderInterface,
  DateProviderInterfaceResolver,
} from "./interfaces/DateProviderInterfaceResolver.ts";

/**
 * date-fns wrappers to handle i18n
 * https://date-fns.org/v2.9.0/docs/I18n
 */

@provider({
  identifier: DateProviderInterfaceResolver,
})
export class DateProvider implements DateProviderInterface {
  format(
    date: Date,
    formatStr = "PP",
    options: Partial<FormatOptionsWithTZ> = {},
  ): string {
    const opt = {
      locale: datefr,
      timeZone: "UTC",
      ...options,
    };

    return format(
      toZonedTime(date, opt.timeZone),
      formatStr,
      opt,
    );
  }
}
