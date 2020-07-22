import {
  NewableType,
  MiddlewareInterface,
  ServiceContainerInterface,
  RegisterHookInterface,
  extension,
} from '@ilos/common';

@extension({
  name: 'middlewares',
})
export class Middlewares implements RegisterHookInterface {
  constructor(
    protected readonly middlewares: (NewableType<MiddlewareInterface> | [string, NewableType<MiddlewareInterface>])[],
  ) {
    //
  }

  public async register(serviceContainer: ServiceContainerInterface): Promise<void> {
    const container = serviceContainer.getContainer();
    const alias = this.middlewares;

    for (const def of alias) {
      if (Array.isArray(def)) {
        const [id, target] = def;
        container.bind(id).to(target);
      } else {
        const identifier = Reflect.getMetadata('extension:identifier', def) as string;
        container.bind(def).toSelf();
        if (identifier) {
          container.bind(identifier).toService(def);
        }
      }
    }
  }
}
