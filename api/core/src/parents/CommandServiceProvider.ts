import { NewableType } from '~/types/NewableType';
import { CommandInterface } from '~/interfaces/CommandInterface';
import { ServiceProviderInterface } from '~/interfaces/ServiceProviderInterface';

import { CommandProvider } from '../providers/CommandProvider';
import { ServiceProvider } from './ServiceProvider';

export abstract class CommandServiceProvider extends ServiceProvider implements ServiceProviderInterface {
  protected commander: CommandProvider;
  public readonly commands: NewableType<CommandInterface>[];

  async boot() {
    await super.boot();
    this.commander = this.container.get<CommandProvider>(CommandProvider);

    for (const command of this.commands) {
      const cmd = this.container.get<CommandInterface>(command);
      this.registerCommand(cmd);
    }
  }

  registerCommand(cmd: CommandInterface): any {
    const command = this.commander.command(cmd.signature);

    command.description(cmd.description);

    for (const option of cmd.options) {
      command.option(option.signature, option.description, option.coerce);
    }

    command.action(async (...args: any[]) => {
      const logger = this.container.get<CommandProvider>(CommandProvider).output;
      try {
        const result = await cmd.call(...args);
        logger(result);
      } catch (e) {
        logger(e);
      }
    });

    return command;
  }
}
