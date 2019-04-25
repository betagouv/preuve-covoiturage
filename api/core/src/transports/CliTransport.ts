import { TransportInterface } from '../interfaces/TransportInterface';
import { KernelInterface } from '../interfaces/KernelInterface';
import { CommandProvider } from '../providers/CommandProvider';

export class CliTransport implements TransportInterface {
  kernel: KernelInterface;
  opts: string[];

  constructor(kernel: KernelInterface, opts: string[] = []) {
    this.kernel = kernel;
    this.opts = opts;
  }

  async up() {
    const commander = <CommandProvider>this.kernel.get('command');
    commander.parse(this.opts);
  }

  async down() {
    return;
  }
}
