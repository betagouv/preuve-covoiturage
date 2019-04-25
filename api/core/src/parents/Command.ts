import { Command as CommanderCommand } from 'commander';

import { KernelInterface } from '../interfaces/KernelInterface';
import { ResultType } from '../types/ResultType';
import { CommandOptionType } from '../types/CommandOptionType';
import { CommandInterface } from '../interfaces/CommandInterface';
import { CommandProvider } from '../providers/CommandProvider';

export abstract class Command implements CommandInterface {
  public readonly signature: string;
  public readonly description: string;
  public readonly options: CommandOptionType[] = [];
  protected kernel: KernelInterface;
  public commander: CommandProvider;
  public command: CommanderCommand;

  constructor(kernel: KernelInterface) {
    this.kernel = kernel;
    this.commander = (<CommandProvider>kernel.get('command'));
  }

  public boot() {
    this.command = this.commander.command(this.signature);

    this.command.description(this.description);

    for (const option of this.options) {
      this.command.option(option.signature, option.description, option.coerce);
    }

    this.command.action(async (...args: any[]) => {
      try {
        const result = await this.call(...args);
        return result;
      } catch (e) {
        throw e;
      }
    });
  }

  public async call(...args: any[]):Promise<ResultType> {
    throw new Error('No implementation found');
  }
}

