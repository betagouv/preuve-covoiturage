import * as commander from 'commander';

import { provider, ProviderInterface } from '/ilos/common/index.ts';

/**
 * Commander provider
 * @export
 * @class CommandProvider
 * @extends {Command}
 * @implements {ProviderInterface}
 */
@provider()
export class CommandRegistry extends commander.Command implements ProviderInterface {
  output(...args: any[]) {
    console.info(...args);
  }
}
