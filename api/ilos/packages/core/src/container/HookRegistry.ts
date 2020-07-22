import { IdentifierType, HookInterface, ServiceContainerInterface } from '@ilos/common';

import { hasInterface } from '../helpers/types/hasInterface';

export class HookRegistry<T> {
  protected registry: Set<HookInterface> = new Set();
  protected dispatched = false;

  constructor(protected method: string, protected authorizeIdentifierLookup = true) {
    //
  }

  public register(hooker: object, identifier?: IdentifierType): void {
    if (hasInterface<T>(hooker, this.method) && (!identifier || this.authorizeIdentifierLookup)) {
      let hook = async (container: ServiceContainerInterface) => hooker[this.method](container);
      if (identifier) {
        // prettier-ignore
        hook = async (container: ServiceContainerInterface) =>
          container
            .getContainer()
            .get<T>(identifier)[this.method](container);
      }
      this.add(hook);
    }
    return;
  }

  protected add(hook: HookInterface) {
    if (!this.dispatched) {
      this.registry.add(hook);
    }
  }

  public async dispatch(serviceContainer: ServiceContainerInterface) {
    this.dispatched = true;
    const promises: Promise<void>[] = [];

    for (const [hook] of this.registry.entries()) {
      promises.push((async () => hook(serviceContainer))());
    }
    await Promise.all(promises);
    this.registry.clear();
  }
}
