import { RegisterHookInterface, NewableType, ServiceContainerInterface, IdentifierType, extension } from '@ilos/common';

@extension({
  name: 'providers',
  // TODO add require: ['*'] in order to process this extension last
})
export class Providers implements RegisterHookInterface {
  constructor(protected readonly alias: (NewableType<any> | [IdentifierType, NewableType<any>])[]) {
    //
  }

  public async register(serviceContainer: ServiceContainerInterface): Promise<void> {
    const container = serviceContainer.getContainer();
    const alias = this.alias;
    for (const def of alias) {
      let target: NewableType<any>;
      if (Array.isArray(def)) {
        if (def.length !== 2) {
          throw new Error('Invalid bindings');
        }
        const identifier = def[0];
        target = def[1];
        container.bind(target).toSelf();
        container.bind(identifier).toService(target);
      } else {
        const customIdentifier = Reflect.getMetadata(Symbol.for('extension:identifier'), def) as
          | IdentifierType
          | IdentifierType[];
        target = def;
        container.bind(target).toSelf();
        if (customIdentifier) {
          if (!Array.isArray(customIdentifier)) {
            container.bind(customIdentifier).toService(def);
          } else {
            for (const id of customIdentifier) {
              container.bind(id).toService(def);
            }
          }
        }
      }
      serviceContainer.registerHooks(target.prototype, target);
    }
  }
}
