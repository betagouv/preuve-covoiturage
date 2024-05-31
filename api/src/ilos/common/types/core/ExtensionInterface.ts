import { InitHookInterface, DestroyHookInterface, RegisterHookInterface } from '../hooks/index.ts';
import { NewableType } from '../shared/index.ts';

export type ExtensionInterface = InitHookInterface | DestroyHookInterface | RegisterHookInterface;

export type ExtensionConfigurationType = {
  name: string;
  key?: symbol;
  autoload?: boolean;
  decoratorKey?: symbol;
  require?: NewableType<ExtensionInterface>[];
  override?: boolean;
};

export const extensionConfigurationMetadataKey = Symbol.for('extensionConfiguration');
