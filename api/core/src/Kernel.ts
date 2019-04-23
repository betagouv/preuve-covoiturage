import { KernelInterface } from './interfaces/KernelInterface';
import { ServiceProviderInterface } from './interfaces/ServiceProviderInterface';
import { RPCCallType } from './types/RPCCallType';
import { RPCResponseType } from './types/RPCResponseType';
import { RPCSingleCallType } from './types/RPCSingleCallType';
import { RPCSingleResponseType } from './types/RPCSingleResponseType';

import { ProviderInterface } from './interfaces/ProviderInterface';
import { ServiceProviderConstructorInterface } from './interfaces/ServiceProviderConstructorInterface';
import { ProviderConstructorInterface } from './interfaces/ProviderConstructorInterface';
import { TransportInterface } from './interfaces/TransportInterface';
import { TransportConstructorInterface } from './interfaces/TransportConstructorInterface';

import { resolveMethodFromString } from './helpers/resolveMethod';
import { hasMultipleCall } from './helpers/types/hasMultipleCall';
import { isAnRPCException } from './helpers/types/isAnRPCException';
import { MethodNotFoundException } from './Exceptions/MethodNotFoundException';

export class Kernel implements KernelInterface {
  protected serviceRegistry: Map<string, ServiceProviderInterface> = new Map();
  protected providerRegistry: Map<string, ProviderInterface> = new Map();

  transport?: TransportInterface;
  providers: ProviderConstructorInterface[] = [];
  services: ServiceProviderConstructorInterface[] = [];

  public async boot() {
    for (const providerContructor of this.providers) {
      const provider = new providerContructor(this);
      await provider.boot();
      this.providerRegistry.set(provider.signature, provider);
    }

    for (const serviceProviderConstructor of this.services) {
      const serviceProvider = new serviceProviderConstructor(this);
      await serviceProvider.boot();
      this.serviceRegistry.set(serviceProvider.signature, serviceProvider);
    }
  }

  public get(name: string):ProviderInterface {
    if (!this.providerRegistry.has(name)) {
      throw new Error(`Unknown provider ${name}`);
    }
    return this.providerRegistry.get(name);
  }

  public async up(transportConstructor: TransportConstructorInterface, opts?: object) {
    this.transport = new transportConstructor(this, opts);
    return this.transport.up();
  }

  public async down() {
    return this.transport.down();
  }

  protected async resolve(call: RPCSingleCallType): Promise<RPCSingleResponseType> {
    const { method, service } = resolveMethodFromString(<string>call.method);

    try {
      if (!this.serviceRegistry.has(service)) {
        throw new MethodNotFoundException(`Unknown service ${service}`);
      }

      const response = await this.serviceRegistry.get(service).call(method, call.params, null);
      return {
        id: call.id,
        result: response,
        jsonrpc: '2.0',
      };
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

  async handle(call: RPCCallType): Promise<RPCResponseType> {
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
