import { ServiceContainerInterface, NewableType, KernelInterface, kernel as kernelDecorator } from '@ilos/common';
import { Kernel as AbstractKernel } from '@ilos/framework';
import { v4 } from 'uuid';

export interface KernelTestInterface {
  kernel: KernelInterface;
}

export function makeKernel(serviceProviderCtor: NewableType<ServiceContainerInterface>): KernelInterface {
  @kernelDecorator({
    children: [serviceProviderCtor],
  })
  class Kernel extends AbstractKernel {}
  return new Kernel();
}

// let other packages use uuid without npm install to limit deps
export function uuid(): string {
  return v4();
}
