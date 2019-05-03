import { Kernel as ParentKernel } from './parents/Kernel';
import { EnvProvider } from './providers/EnvProvider';
import { ConfigProvider } from './providers/ConfigProvider';
import { CommandProvider } from './providers/CommandProvider';
import { CommandServiceProvider } from './parents/CommandServiceProvider';
import { CallCommand } from './commands/CallCommand';

class BaseCommandServiceProvider extends CommandServiceProvider {
  commands = [
    CallCommand,
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
