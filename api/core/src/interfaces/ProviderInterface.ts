import { KernelInterface } from "./KernelInterface";

export interface ProviderInterface {
  readonly signature: string;

  // constructor(kernel: KernelInterface):void;

  boot():Promise<void> | void;
}
