import { ServiceProviderInterface } from './ServiceProviderInterface';
import { RPCCallType } from '../types/RPCCallType';
import { RPCResponseType } from '../types/RPCResponseType';

export interface KernelInterface extends ServiceProviderInterface {
  handle(call: RPCCallType): Promise<RPCResponseType | void>;
  // up(opts?: string[]): Promise<void>;
  // down(): Promise<void>;
}
