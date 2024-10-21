import {
  extension,
  IdentifierType,
  NewableType,
  RegisterHookInterface,
  ServiceContainerInterface,
} from "@/ilos/common/index.ts";

@extension({
  name: "providers",
  // TODO add require: ['*'] in order to process this extension last
})
export class Providers implements RegisterHookInterface {
  constructor(
    protected readonly alias: (NewableType<any> | [IdentifierType, NewableType<any>])[],
  ) {
    //
  }

  public async register(
    serviceContainer: ServiceContainerInterface,
  ): Promise<void> {
    const container = serviceContainer.getContainer();
    const alias = this.alias;
    for (const def of alias) {
      let target, identifier;
      if (Array.isArray(def)) {
        if (def.length !== 2) {
          throw new Error("Invalid bindings");
        }
        [identifier, target] = def;
        container.bind(identifier).toConstantValue(target);
        serviceContainer.registerHooks(target, identifier);
      } else {
        const customIdentifier = Reflect.getMetadata(
          Symbol.for("extension:identifier"),
          def,
        ) as
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
        serviceContainer.registerHooks(target.prototype, target);
      }
    }
  }
}
