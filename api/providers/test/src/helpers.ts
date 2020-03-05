import {
  ServiceContainerInterface,
  NewableType,
  KernelInterface,
  kernel as kernelDecorator,
} from '@ilos/common';
import { Kernel as AbstractKernel } from '@ilos/framework';

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

