import { KernelInterface, TransportInterface } from '@ilos/common';

import { CommandRegistry } from '../providers/CommandRegistry';

/**
 * Cli Transport
 * @export
 * @class CliTransport
 * @implements {TransportInterface}
 */
export class CliTransport implements TransportInterface<void> {
  kernel: KernelInterface;

  constructor(kernel: KernelInterface) {
    this.kernel = kernel;
  }

  getInstance(): void {
    return;
  }

  getKernel(): KernelInterface {
    return this.kernel;
  }

  async up(opts: string[] = []) {
    this.kernel
      .getContainer()
      .get<CommandRegistry>(CommandRegistry)
      .parse(opts);
  }

  async down() {
    return;
  }
}
