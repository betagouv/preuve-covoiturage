import {
  extension,
  NewableType,
  RegisterHookInterface,
  ServiceContainerInterface,
} from "@/ilos/common/index.ts";

@extension({
  name: "connections",
})
export class ConnectionManagerExtension implements RegisterHookInterface {
  constructor(protected readonly alias: [NewableType<any>, any][]) {}

  async register(serviceContainer: ServiceContainerInterface): Promise<void> {
    for (const [identifier, target] of this.alias) {
      serviceContainer.getContainer().bind(identifier).toConstantValue(target);
      serviceContainer.registerHooks(target, identifier);
    }
  }
}
