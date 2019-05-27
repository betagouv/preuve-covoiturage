import { Kernel as ParentKernel } from './parents/Kernel';
import { EnvProvider } from './providers/EnvProvider';
import { ConfigProvider } from './providers/ConfigProvider';
import { CommandProvider } from './providers/CommandProvider';
import { CommandServiceProvider } from './parents/CommandServiceProvider';
import { CallCommand } from './commands/CallCommand';
import { ListCommand } from './commands/ListCommand';

class BaseCommandServiceProvider extends CommandServiceProvider {
  commands = [
    CallCommand,
    ListCommand,
  ];
}

export class Kernel extends ParentKernel {
  readonly alias = [
    EnvProvider,
    ConfigProvider,
    CommandProvider,
  ];

  readonly serviceProviders = [
    BaseCommandServiceProvider,
  ];
}
