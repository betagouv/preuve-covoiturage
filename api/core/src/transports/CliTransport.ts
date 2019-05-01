import { TransportInterface } from '../interfaces/TransportInterface';
import { KernelInterface } from '../interfaces/KernelInterface';
import { CommandProvider } from '../providers/CommandProvider';

export class CliTransport implements TransportInterface {
  kernel: KernelInterface;

  constructor(kernel: KernelInterface) {
    this.kernel = kernel;
  }

  async up(opts: string[] = []) {
    this.kernel.getContainer().get<CommandProvider>(CommandProvider).parse(opts);
  }

  async down() {
    return;
  }
}
