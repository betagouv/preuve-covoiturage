import {
  ServiceContainerInterface,
  InitHookInterface,
  RegisterHookInterface,
  CommandStaticInterface,
  CommandInterface,
  extension,
  ResultType,
} from '@ilos/common';

import { CommandRegistry } from '../providers/CommandRegistry';

@extension({
  name: 'commands',
  autoload: true,
})
export class CommandExtension implements RegisterHookInterface, InitHookInterface {
  constructor(readonly commands: CommandStaticInterface[] = []) {
    //
  }

  async register(serviceContainer: ServiceContainerInterface) {
    serviceContainer.ensureIsBound(CommandRegistry, CommandRegistry);

    for (const command of this.commands) {
      serviceContainer.bind(command);
    }
  }

  async init(serviceContainer: ServiceContainerInterface) {
    const commandRegistry = serviceContainer.get<CommandRegistry>(CommandRegistry);

    for (const command of this.commands) {
      const processCommand = async (...args: any[]): Promise<ResultType> =>
        serviceContainer.get<CommandInterface>(command).call(...args);

      this.registerCommand(commandRegistry, command, processCommand);
    }
  }

  protected registerCommand(
    registry: CommandRegistry,
    cmd: CommandStaticInterface,
    processCommand: (...args: any[]) => Promise<ResultType>,
  ): any {
    const command = registry.command(cmd.signature);

    command.description(cmd.description);

    for (const option of cmd.options) {
      const { signature, description, coerce, default: def } = option;
      const args = [];
      if (typeof coerce === 'function') {
        args.push(coerce);
      }
      if (def !== undefined) {
        args.push(def);
      }
      command.option(signature, description, ...args);
    }

    command.action(async (...args: any[]) => {
      const logger = registry.output;
      try {
        const result = await processCommand(...args);
        logger(result);
        process.exit(0);
      } catch (e) {
        logger(e);
        process.exit(1);
      }
    });

    return command;
  }
}
