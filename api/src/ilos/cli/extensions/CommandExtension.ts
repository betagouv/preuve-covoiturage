import {
  ServiceContainerInterface,
  InitHookInterface,
  RegisterHookInterface,
  CommandStaticInterface,
  CommandInterface,
  extension,
  ResultType,
} from '/ilos/common/index.ts';

import { CommandRegistry } from '../providers/CommandRegistry.ts';

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
        result && logger(result);

        // exit(0) only when not running AVA tests as it overrides
        // the process.exit function and crashes tests with a warning.
        // If we don't process.exit(0) in regular commands, it will wait forever
        if (/^ava /.test(process.env['npm_lifecycle_script']) === false) {
          process.exit(0);
        }
      } catch (e) {
        logger(e.message);
        throw e;
      }
    });

    return command;
  }
}
