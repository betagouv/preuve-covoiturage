import { Container as InversifyContainer, ContainerOptions } from "@/deps.ts";
import {
  ContainerInterface,
  ContextType,
  FunctionalHandlerInterface,
  HandlerConfigType,
  HandlerInterface,
  NewableType,
  ParamsType,
  ResultType,
} from "@/ilos/common/index.ts";
import { HandlerRegistry } from "./HandlerRegistry.ts";

export class Container extends InversifyContainer
  implements ContainerInterface {
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
  constructor(containerOptions?: ContainerOptions) {
    super({
      defaultScope: "Singleton",
      autoBindInjectable: true,
      skipBaseClassChecks: true,
      ...containerOptions,
    });
  }

  createChild(containerOptions: ContainerOptions = {}): Container {
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
    return this.handlersRegistry.get<P, C, R>(config);
  }

  getHandlers(): (HandlerConfigType & { resolver: Function })[] {
    return this.handlersRegistry.all();
  }
}
