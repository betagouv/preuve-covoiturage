import { ProviderInterface } from "@/ilos/common/index.ts";
import { datetz } from "@/deps.ts";

export interface DateProviderInterface extends ProviderInterface {
  format(
    date: Date,
    formatStr: string,
    options: Partial<datetz.FormatOptionsWithTZ>,
  ): string;
}

export abstract class DateProviderInterfaceResolver
  implements DateProviderInterface {
  format(
    date: Date,
    formatStr = "PP",
    options: Partial<datetz.FormatOptionsWithTZ> = {},
  ): string {
    throw new Error("Method not implemented.");
  }
}
