import { KernelInterface, TransportInterface } from "@/ilos/common/index.ts";

import { runCommand } from "@/ilos/cli/commander.ts";

/**
 * Cli Transport
 * @export
 * @class CliTransport
 * @implements {TransportInterface}
 */
export class CliTransport implements TransportInterface<void> {
  constructor(public kernel: KernelInterface) {
  }

  getInstance(): void {
    return;
  }

  getKernel(): KernelInterface {
    return this.kernel;
  }

  async up(opts: string[] = []) {
    await runCommand(this.kernel, opts);
  }

  async down() {
    return;
  }
}
