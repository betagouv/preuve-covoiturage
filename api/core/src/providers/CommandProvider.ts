import { Command } from 'commander';

import { ProviderInterface } from '../interfaces/ProviderInterface';
import { KernelInterface } from '../interfaces/KernelInterface';

export class CommandProvider extends Command implements ProviderInterface {
  readonly signature: string = 'command';
  private kernel: KernelInterface;
  private config: object = {};

  constructor(kernel: KernelInterface) {
    super();
    this.kernel = kernel;
  }

  boot() {
      //
  }
}
