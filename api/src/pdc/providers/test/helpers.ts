import * as connections from "@/config/connections.ts";
import { v4 } from "@/deps.ts";
import {
  kernel as kernelDecorator,
  KernelInterface,
  NewableType,
  ServiceContainerInterface,
} from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import { RedisConnection } from "@/ilos/connection-redis/index.ts";
import { Kernel as AbstractKernel } from "@/ilos/framework/index.ts";

export interface KernelContext {
  kernel: KernelInterface;
  service: ServiceContainerInterface;
}
export interface KernelBeforeAfter {
  before(): Promise<KernelContext>;
  after(cfg: KernelContext): Promise<void>;
}

export function makeKernelCtor(
  serviceProviderCtor: NewableType<ServiceContainerInterface>,
): NewableType<KernelInterface> {
  @kernelDecorator({
    children: [serviceProviderCtor],
    connections: [
      [RedisConnection, new RedisConnection(connections.redis)],
      [PostgresConnection, new PostgresConnection(connections.postgres)],
    ],
  })
  class Kernel extends AbstractKernel {}
  return Kernel;
}

export function makeKernel(
  serviceProviderCtor: NewableType<ServiceContainerInterface>,
): KernelInterface {
  return new (makeKernelCtor(serviceProviderCtor))();
}

// let other packages use uuid without npm install to limit deps
export function uuid(): string {
  return v4();
}

export function makeKernelBeforeAfter(
  serviceProviderCtor: NewableType<ServiceContainerInterface>,
): KernelBeforeAfter {
  async function before(): Promise<KernelContext> {
    const kernel = makeKernel(serviceProviderCtor);
    await kernel.bootstrap();
    const service = kernel.get(serviceProviderCtor);
    return { kernel, service };
  }

  async function after(cfg: KernelContext): Promise<void> {
    await cfg.kernel.shutdown();
  }
  return { before, after };
}
