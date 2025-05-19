import * as connections from "@/config/connections.ts";
import {
  kernel as kernelDecorator,
  KernelInterface,
  NewableType,
  ServiceContainerInterface,
} from "@/ilos/common/index.ts";
import { LegacyPostgresConnection } from "@/ilos/connection-postgres/index.ts";
import { RedisConnection } from "@/ilos/connection-redis/index.ts";
import { Kernel as AbstractKernel } from "@/ilos/framework/index.ts";
import { v4 as uuidV4 } from "@/lib/uuid/index.ts";

/**
 * AJV inputs require dates to be strings when they are of type Date in the code.
 * This helper allows to define the type of the params and the key that should be a string.
 *
 * @example
 * const payload: AJVParamsInterface<ParamsInterface, "start_at" | "end_at"> = {
 *   start_at: new Date().toISOString(),
 *   end_at: new Date().toISOString(),
 * }
 *
 * @params {T} An imported ResultParamsInterface from *.contract.ts
 * @params {K} A union of keys from T that should be converted to strings
 */
export type AJVParamsInterface<T, K extends keyof T> =
  & Omit<T, K>
  & { [P in K]: string };

export interface KernelContext {
  kernel: KernelInterface;
  services: ServiceContainerInterface[];
}
export interface KernelBeforeAfter {
  before(): Promise<KernelContext>;
  after(cfg: KernelContext): Promise<void>;
}

export function makeKernelCtor(
  ...serviceProviderCtor: NewableType<ServiceContainerInterface>[]
): NewableType<KernelInterface> {
  @kernelDecorator({
    children: [...serviceProviderCtor],
    providers: [
      [RedisConnection, new RedisConnection(connections.redis)],
      [LegacyPostgresConnection, new LegacyPostgresConnection(connections.postgres)],
    ],
  })
  class Kernel extends AbstractKernel {}
  return Kernel;
}

export function makeKernel(
  ...serviceProviderCtor: NewableType<ServiceContainerInterface>[]
): KernelInterface {
  return new (makeKernelCtor(...serviceProviderCtor))();
}

// let other packages use uuid without npm install to limit deps
// TODO move to a common package or replace with Deno std !
export function uuid(): string {
  return uuidV4();
}

/**
 * Create Kernel before and after helpers for integration tests
 *
 * @example
 * // with 2 ServiceProviders
 * const { before, after } = makeKernelBeforeAfter(ServiceProviderA, ServiceProviderB);
 * let kc: KernelContext;
 * beforeAll(async () => {
 *   kc = await before();
 * });
 * afterAll(async () => {
 *   await after(kc);
 * });
 *
 * @example
 * // with a test database connection
 * const { before: dbBefore, after: dbAfter } = makeLegacyDbBeforeAfter();
 * const { before: kernelBefore, after: kernelAfter } = makeKernelBeforeAfter(ServiceProvider);
 * let db: DbContext;
 * let kc: KernelContext;
 * beforeAll(async () => {
 *   db = await dbBefore();
 *   kc = await kernelBefore();
 * });
 * afterAll(async () => {
 *   await kernelAfter(kc);
 *   await dbAfter(db);
 * });
 *
 * @param {NewableType<ServiceContainerInterface>[]} serviceProviderCtor
 * @returns {before, after}
 */
export function makeKernelBeforeAfter(
  ...serviceProviderCtor: NewableType<ServiceContainerInterface>[]
): KernelBeforeAfter {
  async function before(): Promise<KernelContext> {
    const kernel = makeKernel(...serviceProviderCtor);
    await kernel.bootstrap();
    const services = serviceProviderCtor.map((
      s: NewableType<ServiceContainerInterface>,
    ) => kernel.get(s));
    return { kernel, services };
  }

  async function after(cfg: KernelContext): Promise<void> {
    await cfg.kernel.shutdown();
  }
  return { before, after };
}
