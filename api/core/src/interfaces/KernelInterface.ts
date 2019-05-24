import { ServiceProviderInterface } from './ServiceProviderInterface';
import { RPCCallType } from '../types/RPCCallType';
import { RPCResponseType } from '../types/RPCResponseType';
import { ContainerInterface, ContainerModuleConfigurator } from '../container';

export interface KernelInterface extends ServiceProviderInterface {

  /**
   * Handle an RPC call and provide an RPC response
   * @param {RPCCallType} call
   * @returns {(Promise<RPCResponseType | void>)}
   * @memberof KernelInterface
   */
  handle(call: RPCCallType): Promise<RPCResponseType | void>;
}

export abstract class KernelInterfaceResolver implements KernelInterface {
  readonly alias = [];
  readonly middlewares = [];
  readonly serviceProviders = [];

  getContainer():ContainerInterface {
    throw new Error();
  }

  boot() {
    throw new Error();
  }

  register(module: ContainerModuleConfigurator) {
    throw new Error();
  }

  async handle(call: RPCCallType): Promise<RPCResponseType|void> {
    throw new Error();
  }
}
