import {
  ContextType,
  ParamsType,
  ResultType,
  RPCCallType,
  RPCResponseType,
} from "../call/index.ts";
import {
  ServiceContainerInterface,
  ServiceContainerInterfaceResolver,
} from "./ServiceContainerInterface.ts";
import { BootstrapHookInterface } from "../hooks/BootstrapHookInterface.ts";
import { ShutdownHookInterface } from "../hooks/ShutdownHookInterface.ts";

export interface KernelInterface
  extends
    ServiceContainerInterface,
    BootstrapHookInterface,
    ShutdownHookInterface {
  /**
   * Handle an RPC call and provide an RPC response
   * @param {RPCCallType} call
   * @returns {(Promise<RPCResponseType | void>)}
   * @memberof KernelInterface
   */
  handle(call: RPCCallType): Promise<RPCResponseType | void>;

  call<P = ParamsType, R = ResultType>(
    method: string,
    params: P,
    context: ContextType,
  ): Promise<R>;

  notify<P = ParamsType>(
    method: string,
    params: P,
    context: ContextType,
  ): Promise<void>;
}

export abstract class KernelInterfaceResolver
  extends ServiceContainerInterfaceResolver
  implements KernelInterface {
  async handle(call: RPCCallType): Promise<RPCResponseType | void> {
    throw new Error();
  }

  async call<P = ParamsType, R = ResultType>(
    method: string,
    params: P,
    context: ContextType,
  ): Promise<R> {
    throw new Error();
  }

  async notify<P = ParamsType>(
    method: string,
    params: P,
    context: ContextType,
  ): Promise<void> {
    throw new Error();
  }

  async bootstrap() {
    throw new Error();
  }

  async shutdown() {
    throw new Error();
  }
}
