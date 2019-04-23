import { ActionInterface } from './ActionInterface';
import { KernelInterface } from './KernelInterface';

export type ActionConstructorInterface = new (KernelInterface) => ActionInterface;
