import { KernelInterface } from './KernelInterface';

export interface ProviderInterface {
  readonly signature: string;
  boot():Promise<void> | void;
}
