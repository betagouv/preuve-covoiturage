import {
  ContainerInterface,
  ParamsType,
  ContextType,
  ResultType,
  KernelInterface,
  KernelInterfaceResolver,
  RPCCallType,
  RPCResponseType,
  RPCSingleCallType,
  RPCSingleResponseType,
  MethodNotFoundException,
  InvalidRequestException,
} from '@ilos/common';

import { hasMultipleCall } from '../helpers/types/hasMultipleCall';
import { isAnRPCException } from '../helpers/types/isAnRPCException';
import { ServiceProvider } from './ServiceProvider';

/**
 * Kernel parent class
 * @export
 * @abstract
 * @class Kernel
 * @extends {ServiceProvider}
 * @implements {KernelInterface}
 */
export abstract class Kernel extends ServiceProvider implements KernelInterface {
  /**
   * Creates an instance of Kernel.
   * @param {ContainerInterface} [container]
   * @memberof Kernel
   */
  constructor(container?: ContainerInterface) {
    super(container);
    if (!container) {
      this.container.bind(KernelInterfaceResolver).toConstantValue(this);
    }
  }

  async bootstrap() {
    await this.register();
    await this.init();
  }

  async shutdown() {
    await this.destroy();
  }

  /**
   * Validate a call, check if JSON RPC standart is fulfilled properly
   * @protected
   * @param {RPCSingleCallType} call
   * @returns {void}
   * @memberof Kernel
   */
  protected validate(call: RPCSingleCallType): void {
    const keys = Reflect.ownKeys(call).filter((k: string) => ['jsonrpc', 'method', 'id', 'params'].indexOf(k) < 0);
    if (keys.length > 0) {
      throw new InvalidRequestException('Illegal property');
    }

    if (!('jsonrpc' in call) || call.jsonrpc !== '2.0') {
      throw new InvalidRequestException('jsonrpc must be equal to 2.0');
    }

    if (!('method' in call)) {
      throw new InvalidRequestException('jsonrpc call must have a method property');
    }

    if ('id' in call && typeof call.id !== 'string' && typeof call.id !== 'number' && call.id !== null) {
      throw new InvalidRequestException('id property should be either a string, a number or null');
    }
    return;
  }

  /**
   * Get the targeted handler and call. May throw an MethodNotFoundException
   * @protected
   * @param {*} config
   * @param {*} call
   * @returns
   * @memberof Kernel
   */
  protected async getHandlerAndCall(config, call) {
    const handler = this.getContainer().getHandler(config);
    if (!handler) {
      throw new MethodNotFoundException(`Unknown method or service ${config.signature}`);
    }
    return handler(call);
  }

  /**
   * Call a method
   * @param {string} method
   * @param {ParamsType} params
   * @param {ContextType} [context={ internal: true }]
   * @returns {Promise<ResultType>}
   * @memberof Kernel
   */
  public async call<P = ParamsType, R = ResultType>(method: string, params: P, context: ContextType): Promise<R> {
    return this.getHandlerAndCall({ signature: method }, { method, params, context });
  }

  /**
   * Notify (async call) a method
   * @param {string} method
   * @param {ParamsType} params
   * @param {ContextType} [context={ internal: true }]
   * @returns {Promise<void>}
   * @memberof Kernel
   */
  public async notify<P = ParamsType>(method: string, params: P, context: ContextType): Promise<void> {
    return this.getHandlerAndCall({ signature: method, queue: true }, { method, params, context });
  }

  /**
   * Resolve a single RPC call
   * @protected
   * @param {RPCSingleCallType} call
   * @returns {(Promise<RPCSingleResponseType | void>)}
   * @memberof Kernel
   */
  protected async resolve(call: RPCSingleCallType): Promise<RPCSingleResponseType | void> {
    try {
      this.validate(call);
      let context = null;
      let params = null;

      if ('params' in call) {
        params = call.params;
        if ('_context' in call.params) {
          context = call.params._context;
          params = call.params.params;
        }
      }

      if ('id' in call) {
        const response = await this.call(call.method, params, context);

        return {
          id: call.id,
          result: response,
          jsonrpc: '2.0',
        };
      }
      await this.notify(call.method, params, context);
      return;
    } catch (e) {
      if (isAnRPCException(e)) {
        return {
          id: call.id,
          error: e.rpcError,
          jsonrpc: '2.0',
        };
      }
      return {
        id: call.id,
        error: {
          code: -32000,
          message: 'Server error',
          data: e.message,
        },
        jsonrpc: '2.0',
      };
    }
  }

  /**
   * Handle an RPC Call
   * @param {RPCCallType} call
   * @returns {Promise<RPCResponseType>}
   * @memberof Kernel
   */
  async handle(call: RPCCallType): Promise<RPCResponseType> {
    if (!Array.isArray(call) && typeof call !== 'object') {
      throw new InvalidRequestException();
    }

    if (!hasMultipleCall(call)) {
      return this.resolve(call);
    }

    const promises: Promise<RPCSingleResponseType>[] = [];

    call.forEach((c) => {
      promises.push(this.resolve(c));
    });

    const responses = await Promise.all(promises);
    return responses;
  }
}
