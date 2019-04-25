import { KernelInterface } from './KernelInterface';

export interface TransportInterface {
  kernel: KernelInterface;
  opts: string[];

  up():Promise<void>;

  down():Promise<void>;
}
