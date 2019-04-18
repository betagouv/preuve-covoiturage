import { ProviderInterface } from './ProviderInterface';
import { RPCCallType } from '../types/RPCCallType';
import { RPCResponseType } from '../types/RPCResponseType';

export interface KernelInterface {
    providers: ProviderInterface[];
    handle(call: RPCCallType): Promise<RPCResponseType>;
}