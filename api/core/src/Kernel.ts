import { Kernel as ParentKernel } from './parents/Kernel';
import { ProviderConstructorInterface } from './interfaces/ProviderConstructorInterface';
import { ServiceProviderConstructorInterface } from './interfaces/ServiceProviderConstructorInterface';
import { CommandConstructorInterface } from './interfaces/CommandConstructorInterface';
import { EnvProvider } from './providers/EnvProvider';
import { ConfigProvider } from './providers/ConfigProvider';
import { CommandProvider } from './providers/CommandProvider';
import { CallCommand } from './commands/CallCommand';

export class Kernel extends ParentKernel {
  providers: ProviderConstructorInterface[] = [
    EnvProvider,
    ConfigProvider,
    CommandProvider,
  ];
  services: ServiceProviderConstructorInterface[] = [];
  commands: CommandConstructorInterface[] = [
    CallCommand,
  ];
}
