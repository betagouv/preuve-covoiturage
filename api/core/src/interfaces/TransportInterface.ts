import { KernelInterface } from './KernelInterface';

export interface TransportInterface {
  kernel: KernelInterface;

  up():Promise<void>;

  down():Promise<void>;
}
