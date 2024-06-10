import { Command } from "@/deps.ts";
import { provider, ProviderInterface } from "@/ilos/common/index.ts";

/**
 * Commander provider
 * @export
 * @class CommandProvider
 * @extends {Command}
 * @implements {ProviderInterface}
 */
@provider()
export class CommandRegistry extends Command implements ProviderInterface {
  output(...args: any[]) {
    console.info(...args);
  }
}
