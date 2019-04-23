import { ProviderInterface } from './ProviderInterface';
import { KernelInterface } from './KernelInterface';

export type ProviderConstructorInterface = new (kernel:KernelInterface) => ProviderInterface;
