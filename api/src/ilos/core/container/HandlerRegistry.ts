import {
  CallType,
  ContainerInterface,
  ContextType,
  FunctionalHandlerInterface,
  HandlerConfigType,
  HandlerInterface,
  HandlerMeta,
  MiddlewareInterface,
  NewableType,
  ParamsType,
  ResultType,
  SingleMiddlewareConfigType,
} from "@/ilos/common/index.ts";
import { handlerListIdentifier } from "@/ilos/core/constants.ts";
import { NextFunction } from "dep:express";
import { compose } from "../helpers/index.ts";
import { normalizeHandlerConfig } from "../helpers/normalizeHandlerConfig.ts";

export class HandlerRegistry {
  static readonly key: symbol = handlerListIdentifier;

  constructor(protected container: ContainerInterface) {}

  /**
   * Get all registred handlers
   *
   * @returns {HandlerConfigType[]}
   * @memberof Container
   */
  all(): (HandlerConfigType & { resolver: Function })[] {
    try {
      return this.container.root.getAll(HandlerRegistry.key);
    } catch {
      return [];
    }
  }

  protected buildHandlerMiddlewares(
    middlewaresConfig: SingleMiddlewareConfigType[],
  ): NextFunction {
    const middlewares = middlewaresConfig.map((value) => {
      if (typeof value === "string") {
        return this.container.get<MiddlewareInterface>(value);
      }
      const [key, config] = value;
      const middleware = this.container.get<MiddlewareInterface>(key);
      return [middleware, config];
    }) as (MiddlewareInterface | [MiddlewareInterface, any])[];
    return compose(middlewares);
  }

  /**
   * Set an handler
   * @param {NewableType<HandlerInterface>} handler
   * @memberof Container
   */
  set(handler: NewableType<HandlerInterface>): void {
    const service = Reflect.getMetadata(HandlerMeta.SERVICE, handler);
    const method = Reflect.getMetadata(HandlerMeta.METHOD, handler);
    const version = Reflect.getMetadata(HandlerMeta.VERSION, handler);
    const local = Reflect.getMetadata(HandlerMeta.LOCAL, handler);
    const apiRoute = Reflect.getMetadata(HandlerMeta.API_ROUTE, handler);

    const middlewares = Reflect.getMetadata(HandlerMeta.MIDDLEWARES, handler) ||
      [];
    const handlerConfig = normalizeHandlerConfig({
      service,
      method,
      version,
      local,
      apiRoute,
    });

    this.container.bind(handler).toSelf();

    const resolver: FunctionalHandlerInterface = (call: CallType) =>
      this.buildHandlerMiddlewares(middlewares)(
        call.params,
        call.context,
        async (params: ParamsType, context: ContextType) =>
          this.container.get<HandlerInterface>(handler).call({
            ...call,
            params,
            context,
          }),
      );

    this.container.root.bind(HandlerRegistry.key).toConstantValue({
      ...handlerConfig,
      resolver,
    });

    // TODO: throw error if not found
    // TODO: throw error if duplicate

    return;
  }

  /**
   * Get a particular handler
   *
   * [local, sync] => [local/sync, local/sync/*, remote/sync, remote/sync/*]
   * [local, async] => [local/async, local/async/*, local/sync, local/sync/*, remote/sync, remote/sync/*]
   * [remote, sync] => [remote/sync, remote/sync/*]
   * [remote, async] => [remote/sync, remote/sync/*]
   *
   * @param {HandlerConfigType} initialConfig
   * @returns {HandlerInterface}
   * @memberof Container
   */
  get<P = ParamsType, C = ContextType, R = ResultType>(
    initialConfig: HandlerConfigType,
  ): FunctionalHandlerInterface<P, C, R> | null {
    const config = normalizeHandlerConfig(initialConfig);

    // local is true by default
    if (!("local" in config) || config.local === undefined) {
      config.local = true;
    }

    const handlers = this.all()
      .filter(
        (hconfig) =>
          // same service
          config.service === hconfig.service &&
          // same method or *
          (config.method === hconfig.method || hconfig.method === "*") &&
          // local + remote or just remote if asked
          (config.local || !hconfig.local),
      )
      .sort((hconfig1, hconfig2) => {
        if (hconfig1.local !== hconfig2.local) {
          return hconfig1.local === config.local ? -1 : 1;
        }

        if (hconfig1.method !== hconfig2.method) {
          return hconfig1.method === config.method ? -1 : 1;
        }

        return 0;
      });

    const firstHandler = handlers.length > 0 && handlers.shift();
    if (!firstHandler || !firstHandler.resolver) {
      return null;
    }

    /**
     * resolver type is 'Function'
     * @todo: fix resolver type to be FunctionalHandlerInterface
     */
    return firstHandler.resolver as FunctionalHandlerInterface<P, C, R>;
  }
}
