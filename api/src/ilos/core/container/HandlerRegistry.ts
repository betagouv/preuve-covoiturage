import {
  FunctionalHandlerInterface,
  SingleMiddlewareConfigType,
  FunctionMiddlewareInterface,
  NewableType,
  HandlerInterface,
  HandlerConfigType,
  ContainerInterface,
  HandlerMeta,
  CallType,
  ParamsType,
  ContextType,
  ResultType,
  MiddlewareInterface,
} from '@ilos/common';

import { normalizeHandlerConfig } from '../helpers/normalizeHandlerConfig';
import { compose } from '../helpers';

export class HandlerRegistry {
  static readonly key: symbol = Symbol.for('handlers');

  constructor(protected container: ContainerInterface) {
    //
  }

  /**
   * Get all registred handlers
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

  protected buildHandlerMiddlewares(middlewaresConfig: SingleMiddlewareConfigType[]): FunctionMiddlewareInterface {
    const middlewares = middlewaresConfig.map((value) => {
      if (typeof value === 'string') {
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
    const queue = Reflect.getMetadata(HandlerMeta.QUEUE, handler);

    const middlewares = Reflect.getMetadata(HandlerMeta.MIDDLEWARES, handler) || [];
    const handlerConfig = normalizeHandlerConfig({ service, method, version, local, queue });

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
   * [local, sync] => [local/sync, local/sync/*, remote/sync, remote/sync/*]
   * [local, async] => [local/async, local/async/*, local/sync, local/sync/*, remote/sync, remote/sync/*]
   * [remote, sync] => [remote/sync, remote/sync/*]
   * [remote, async] => [remote/sync, remote/sync/*]
   * @param {HandlerConfigType} config
   * @returns {HandlerInterface}
   * @memberof Container
   */
  get<P = ParamsType, C = ContextType, R = ResultType>(
    initialConfig: HandlerConfigType,
  ): FunctionalHandlerInterface<P, C, R> {
    const config = normalizeHandlerConfig(initialConfig);

    // local is true by default
    if (!('local' in config) || config.local === undefined) {
      config.local = true;
    }
    // remote/async is not possible now
    if ('local' in config && !config.local && 'queue' in config && config) {
      config.queue = false;
    }

    const handlers = this.all()
      .filter(
        (hconfig) =>
          // same service
          config.service === hconfig.service &&
          // same method or *
          (config.method === hconfig.method || hconfig.method === '*') &&
          // local + remote or just remote if asked
          (config.local || !hconfig.local) &&
          // async + sync or just sync if asked
          (config.queue || !hconfig.queue),
      )
      .sort((hconfig1, hconfig2) => {
        if (hconfig1.local !== hconfig2.local) {
          return hconfig1.local === config.local ? -1 : 1;
        }

        if (hconfig1.queue !== hconfig2.queue) {
          return hconfig1.queue === config.queue ? -1 : 1;
        }

        if (hconfig1.method !== hconfig2.method) {
          return hconfig1.method === config.method ? -1 : 1;
        }

        return 0;
      });
    return handlers.length > 0 ? (handlers.shift().resolver as FunctionalHandlerInterface<P, C, R>) : undefined;
  }
}
