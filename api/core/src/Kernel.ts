import { Kernel as ParentKernel } from './parents/Kernel';
import { EnvProvider } from './providers/EnvProvider';
import { ConfigProvider } from './providers/ConfigProvider';
import { CommandProvider } from './providers/CommandProvider';

export class Kernel extends ParentKernel {
  readonly alias = [
    EnvProvider,
    ConfigProvider,
    CommandProvider,
  ];
}
