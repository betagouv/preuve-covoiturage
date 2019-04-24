import { CommandInterface } from './CommandInterface';
import { KernelInterface } from './KernelInterface';

export type CommandConstructorInterface = new (kernel: KernelInterface) => CommandInterface;
