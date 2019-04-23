import { TransportInterface } from './TransportInterface';
import { KernelInterface } from './KernelInterface';

export type TransportConstructorInterface = new (kernel: KernelInterface, opts?: object) => TransportInterface;
