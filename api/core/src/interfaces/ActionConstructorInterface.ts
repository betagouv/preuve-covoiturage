import { ActionInterface } from './ActionInterface';
import { KernelInterface } from './KernelInterface';

export type ActionConstructorInterface = new (kernel: KernelInterface) => ActionInterface;
