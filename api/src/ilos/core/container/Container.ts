import {
  ContainerInterface,
  ContextType,
  FunctionalHandlerInterface,
  HandlerConfigType,
  HandlerInterface,
  MethodNotFoundException,
  NewableType,
  ParamsType,
  ResultType,
} from "@/ilos/common/index.ts";
import type { interfaces } from "dep:inversify";
import { Container as InversifyContainer } from "dep:inversify";
import { HandlerRegistry } from "./HandlerRegistry.ts";

export class Container extends InversifyContainer implements ContainerInterface {
  protected handlersRegistry: HandlerRegistry = new HandlerRegistry(this);
  declare parent: Container | null;

  get root(): Container {
    if (this.parent) {
      return this.parent.root;
    }
    return this;
  }

  /**
   * Creates an instance of Container.
   * @param {ContainerOptions} [containerOptions]
   * @memberof Container
   */
  constructor(containerOptions?: interfaces.ContainerOptions) {
    super({
      defaultScope: "Singleton",
      autoBindInjectable: true,
      skipBaseClassChecks: true,
      ...containerOptions,
    });
  }

  override createChild(containerOptions: interfaces.ContainerOptions = {}): Container {
    const container = new Container(containerOptions);
    container.parent = this;
    return container;
  }

  setHandler(handler: NewableType<HandlerInterface>) {
    return this.handlersRegistry.set(handler);
  }

  getHandler<P = ParamsType, C = ContextType, R = ResultType>(
    config: HandlerConfigType,
  ): FunctionalHandlerInterface<P, C, R> {
    const handler = this.handlersRegistry.get<P, C, R>(config);

    // FIXME ?
    if (!handler) {
      throw new MethodNotFoundException(
        `Handler not found for ${config.signature}`,
      );
    }

    return handler;
  }

  getHandlers(): (HandlerConfigType & { resolver: Function })[] {
    return this.handlersRegistry.all();
  }
}
