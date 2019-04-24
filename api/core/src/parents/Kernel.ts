import { KernelInterface } from '../interfaces/KernelInterface';
import { ServiceProviderInterface } from '../interfaces/ServiceProviderInterface';
import { RPCCallType } from '../types/RPCCallType';
import { RPCResponseType } from '../types/RPCResponseType';
import { RPCSingleCallType } from '../types/RPCSingleCallType';
import { RPCSingleResponseType } from '../types/RPCSingleResponseType';

import { ProviderInterface } from '../interfaces/ProviderInterface';
import { ServiceProviderConstructorInterface } from '../interfaces/ServiceProviderConstructorInterface';
import { ProviderConstructorInterface } from '../interfaces/ProviderConstructorInterface';
import { TransportInterface } from '../interfaces/TransportInterface';
import { TransportConstructorInterface } from '../interfaces/TransportConstructorInterface';
import { CommandInterface } from '../interfaces/CommandInterface';

import { resolveMethodFromString } from '../helpers/resolveMethod';
import { hasMultipleCall } from '../helpers/types/hasMultipleCall';
import { isAnRPCException } from '../helpers/types/isAnRPCException';
import { MethodNotFoundException } from '../Exceptions/MethodNotFoundException';
import { InvalidRequestException } from '../Exceptions/InvalidRequestException';
import { CommandConstructorInterface } from '../interfaces/CommandConstructorInterface';

export abstract class Kernel implements KernelInterface {
  protected serviceRegistry: Map<string, ServiceProviderInterface> = new Map();
  protected providerRegistry: Map<string, ProviderInterface> = new Map();
  protected commandRegistry: Map<string, CommandInterface> = new Map();

  providers: ProviderConstructorInterface[] = [];
  services: ServiceProviderConstructorInterface[] = [];
  commands: CommandConstructorInterface[] = [];

  protected transport?: TransportInterface;

  public async boot() {
    await this.bootProviders();
    await this.bootServices();
    await this.bootCommands();
  }

  protected async bootServices(): Promise<void> {
    for (const serviceProviderConstructor of this.services) {
      const serviceProvider = new serviceProviderConstructor(this);
      await serviceProvider.boot();
      this.serviceRegistry.set(serviceProvider.signature, serviceProvider);
    }

    return;
  }
  protected async bootProviders(): Promise<void> {
    for (const providerContructor of this.providers) {
      const provider = new providerContructor(this);
      await provider.boot();
      this.providerRegistry.set(provider.signature, provider);
    }

    return;
  }

  protected async bootCommands(): Promise<void> {
    const commands = [...this.commands];

    this.providerRegistry.forEach((provider) => {
      if ('commands' in provider) {
        commands.push(...provider.commands);
      }
    });

    this.serviceRegistry.forEach((provider) => {
      if ('commands' in provider) {
        commands.push(...provider.commands);
      }
    });

    for (const commandConstructor of commands) {
      const command = new commandConstructor(this);
      await command.boot();
      this.commandRegistry.set(command.signature, command);
    }

    return;
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
    try {
      if (!('jsonrpc' in call) || call.jsonrpc !== '2.0') {
        throw new InvalidRequestException('jsonrpc must be equal to 2.0');
      }

      if (!('method' in call)) {
        throw new InvalidRequestException('jsonrpc call must have a method property');
      }

      if (('id' in call) && (typeof call.id !== 'string' && typeof call.id !== 'number' && call.id !== null)) {
        throw new InvalidRequestException('id property should be either a string, a number or null');
      }

      const { method, service } = resolveMethodFromString(<string>call.method);

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
