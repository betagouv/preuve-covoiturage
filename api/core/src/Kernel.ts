import { KernelInterface } from './interfaces/KernelInterface';
import { ServiceProviderInterface } from './interfaces/ServiceProviderInterface';
import { RPCCallType } from './types/RPCCallType';
import { RPCResponseType } from './types/RPCResponseType';
import { RPCSingleCallType } from './types/RPCSingleCallType';
import { RPCSingleResponseType } from './types/RPCSingleResponseType';

import { resolveMethodFromString } from './helpers/resolveMethod';
import { HttpProvider } from './providers/HttpProvider';
import { ProviderInterface } from './interfaces/ProviderInterface';
import { ServiceProviderConstructorInterface } from './interfaces/ServiceProviderConstructorInterface';
import { ProviderConstructorInterface } from './interfaces/ProviderConstructorInterface';
import { TransportInterface } from './interfaces/TransportInterface';
import { TransportConstructorInterface } from './interfaces/TransportConstructorInterface';

export class Kernel implements KernelInterface {
  serviceRegistry: Map<string, ServiceProviderInterface> = new Map();
  providerRegistry: Map<string, ProviderInterface> = new Map();

  transport?: TransportInterface;
  providers: ProviderConstructorInterface[];
  services: ServiceProviderConstructorInterface[];

  config: any;

  constructor(config) {
    this.config = config;
    this.boot();
  }

  public boot() {
    this.providers.forEach(async (providerContructor) => {
      const provider = new providerContructor(this);
      await provider.boot();
      this.providerRegistry.set(provider.signature, provider);
    });

    this.services.forEach(async (serviceProviderConstructor) => {
      const serviceProvider = new serviceProviderConstructor(this);
      await serviceProvider.boot();
      this.serviceRegistry.set(serviceProvider.signature, serviceProvider);
    });
  }

  public up(transportConstructor: TransportConstructorInterface) {
    this.transport = new transportConstructor(this);
    return this.transport.up();
  }

  public down() {
    this.transport.down();
  }

  protected async resolve(call: RPCSingleCallType): Promise<RPCSingleResponseType> {
    const { method, service } = resolveMethodFromString(<string>call.method);

    if (!this.serviceRegistry.has(service)) {
      throw new Error('Unknown service');
    }

    try {
      const response = await this.serviceRegistry.get(service).call(method, call.params, null);
      return {
        id: call.id,
        result: response,
        jsonrpc: '2.0',
      };
    } catch (e) {
      return {
        id: call.id,
        error: {
          code: 0,
          message: e.message,
        },
        jsonrpc: '2.0',
      };
    }
  }

  async handle(call: RPCCallType): Promise<RPCResponseType> {
    // DO VALIDATION
    function hasMultipleCall(c: RPCCallType): c is RPCSingleCallType[] {
      return (<RPCCallType[]>c).forEach !== undefined;
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
