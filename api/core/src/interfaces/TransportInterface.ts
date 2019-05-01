import { KernelInterface } from './KernelInterface';

export interface TransportInterface {
  kernel: KernelInterface;

  up(opts?: string[]):Promise<void>;
  down():Promise<void>;
}
