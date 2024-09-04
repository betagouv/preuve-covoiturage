import {
  HookInterface,
  IdentifierType,
  ServiceContainerInterface,
} from "@/ilos/common/index.ts";
import { hasInterface } from "../helpers/types/hasInterface.ts";

export class HookRegistry<T> {
  protected registry: Set<HookInterface> = new Set();
  protected dispatched = false;

  constructor(
    protected method: string,
    protected authorizeIdentifierLookup = true,
  ) {
    //
  }

  public register(hooker: object, identifier?: IdentifierType): void {
    const hasIface = hasInterface<T>(hooker, this.method);

    if (hasIface && this.authorizeIdentifierLookup && identifier) {
      return this.add(
        async (container?: ServiceContainerInterface) => {
          if (!container) {
            throw new Error("Container is not set");
          }

          const hooker: any = container.getContainer().get<T>(identifier);
          return hooker[this.method](container);
        },
      );
    }

    if (hasIface && (!identifier || this.authorizeIdentifierLookup)) {
      return this.add(
        async (container?: ServiceContainerInterface) => {
          if (!container) {
            throw new Error("Container is not set");
          }

          return (hooker as any)[this.method](container);
        },
      );
    }
  }

  protected add(hook: HookInterface): void {
    if (!this.dispatched) {
      this.registry.add(hook);
    }
  }

  public async dispatch(
    serviceContainer: ServiceContainerInterface,
  ): Promise<void> {
    this.dispatched = true;
    const promises: Promise<void>[] = [];

    for (const [hook] of this.registry.entries()) {
      promises.push((async () => hook(serviceContainer))());
    }
    await Promise.all(promises);
    this.registry.clear();
  }
}
