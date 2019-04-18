import { KernelInterface } from './KernelInterface';

export interface TransportInterface {
  kernel: KernelInterface;

  up():void;

  down():void;
}
