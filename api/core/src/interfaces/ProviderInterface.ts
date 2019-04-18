import { CallInterface } from '../interfaces/CallInterface';

export interface ProviderInterface {
    boot():void
    resolve(call: CallInterface): CallInterface
    call(method: string, parameters: {[prop: string]: any}): {[prop: string]: any};
}
