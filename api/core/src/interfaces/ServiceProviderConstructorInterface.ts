import { ServiceProviderInterface } from './ServiceProviderInterface';
import { KernelInterface } from './KernelInterface';

export type ServiceProviderConstructorInterface = new (kernel:KernelInterface) => ServiceProviderInterface;
