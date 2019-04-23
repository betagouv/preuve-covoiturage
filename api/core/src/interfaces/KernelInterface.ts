import { RPCCallType } from '../types/RPCCallType';
import { RPCResponseType } from '../types/RPCResponseType';

import { KernelInterface } from './KernelInterface';
import { ServiceProviderConstructorInterface } from './ServiceProviderConstructorInterface';
import { ProviderConstructorInterface } from './ProviderConstructorInterface';
import { ProviderInterface } from './ProviderInterface';

export interface KernelInterface {
  providers: ProviderConstructorInterface[];
  services: ServiceProviderConstructorInterface[];
  boot():Promise<void> | void;
  handle(call: RPCCallType): Promise<RPCResponseType>;
  get(name: string):ProviderInterface;
}

