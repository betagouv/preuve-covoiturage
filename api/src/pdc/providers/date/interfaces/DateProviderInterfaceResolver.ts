import { ProviderInterface } from "@/ilos/common/index.ts";
import type { FormatOptionsWithTZ } from "dep:date-fns-tz";

export interface DateProviderInterface extends ProviderInterface {
  format(
    date: Date,
    formatStr: string,
    options: Partial<FormatOptionsWithTZ>,
  ): string;
}

export abstract class DateProviderInterfaceResolver implements DateProviderInterface {
  format(
    date: Date,
    formatStr = "PP",
    options: Partial<FormatOptionsWithTZ> = {},
  ): string {
    throw new Error("Method not implemented.");
  }
}
