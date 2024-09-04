import { KernelInterface, TransportInterface } from "@/ilos/common/index.ts";

import { CommandRegistry } from "../providers/CommandRegistry.ts";

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
    await this.kernel.getContainer().get<CommandRegistry>(CommandRegistry)
      .parseAsync(
        opts,
      );
  }

  async down() {
    return;
  }
}
