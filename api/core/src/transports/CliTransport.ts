import commander from 'commander';

import { TransportInterface } from '../interfaces/TransportInterface';
import { KernelInterface } from '../interfaces/KernelInterface';


export class CliTransport implements TransportInterface {
  kernel: KernelInterface;

  constructor(kernel: KernelInterface) {
    this.kernel = kernel;
  }

  async up() {
    commander.parse(process.argv);
  }

  async down() {
    return;
  }
}
