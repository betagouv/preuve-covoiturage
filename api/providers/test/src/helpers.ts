import { ServiceContainerInterface, NewableType, KernelInterface, kernel as kernelDecorator } from '@ilos/common';
import { Kernel as AbstractKernel } from '@ilos/framework';
import { v4 } from 'uuid';

export interface KernelTestFn {
  kernel: KernelInterface;
}
export interface KernelBeforeAfter {
  before(): Promise<KernelTestFn>;
  after(cfg: KernelTestFn): Promise<void>;
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

export function makeKernelBeforeAfter(serviceProviderCtor: NewableType<ServiceContainerInterface>): KernelBeforeAfter {
  async function before(): Promise<KernelTestFn> {
    const kernel = makeKernel(serviceProviderCtor);
    await kernel.bootstrap();
    return { kernel };
  }

  async function after(cfg: KernelTestFn): Promise<void> {
    await cfg.kernel.shutdown();
  }
  return { before, after };
}
