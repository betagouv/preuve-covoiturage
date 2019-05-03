import { ParamsType } from '~/types/ParamsType';
import { ContextType } from '~/types/ContextType';
import { ResultType } from '~/types/ResultType';
import { ContainerInterface } from '~/Container';

import { KernelInterface } from '../interfaces/KernelInterface';
import { RPCCallType } from '../types/RPCCallType';
import { RPCResponseType } from '../types/RPCResponseType';
import { RPCSingleCallType } from '../types/RPCSingleCallType';
import { RPCSingleResponseType } from '../types/RPCSingleResponseType';
import { resolveMethodFromString } from '../helpers/resolveMethod';
import { hasMultipleCall } from '../helpers/types/hasMultipleCall';
import { isAnRPCException } from '../helpers/types/isAnRPCException';
import { MethodNotFoundException } from '../exceptions/MethodNotFoundException';
import { InvalidRequestException } from '../exceptions/InvalidRequestException';
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
      this.container.bind(Kernel).toConstantValue(this); // PAS SUR QUE CE SOIT UTILE
    }
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

    if (('id' in call) && (typeof call.id !== 'string' && typeof call.id !== 'number' && call.id !== null)) {
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
    try {
      const handler = this.getContainer().getHandler(config);
      if (!handler) {
        throw new MethodNotFoundException(`Unknown method or service ${config.service}:${config.method}`);
      }
      return handler.call(call);
    } catch (e) {
      throw e;
    }
  }


  /**
   * Call a method
   * @param {string} method
   * @param {ParamsType} params
   * @param {ContextType} [context={ internal: true }]
   * @returns {Promise<ResultType>}
   * @memberof Kernel
   */
  public async call(method: string, params: ParamsType, context: ContextType = { internal: true }): Promise<ResultType> {
    const handlerConfig = resolveMethodFromString(method);
    return this.getHandlerAndCall(handlerConfig, { method, params, context });
  }

  
  /**
   * Notify (async call) a method
   * @param {string} method
   * @param {ParamsType} params
   * @param {ContextType} [context={ internal: true }]
   * @returns {Promise<void>}
   * @memberof Kernel
   */
  public async notify(method: string, params: ParamsType, context: ContextType = { internal: true }): Promise<void> {
    const handlerConfig = {
      ...resolveMethodFromString(method),
      transport: 'queue',
    };
    return this.getHandlerAndCall(handlerConfig, { method, params, context });
  }


  /**
   * Resolve a single RPC call
   * @protected
   * @param {RPCSingleCallType} call
   * @returns {(Promise<RPCSingleResponseType | void>)}
   * @memberof Kernel
   */
  protected async resolve(call: RPCSingleCallType): Promise<RPCSingleResponseType | void> {
    let name = 'anonymous';
    if ('name' in this) {
      name = this['name'];
    }
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
    if (!Array.isArray(call) && (typeof call !== 'object')) {
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
