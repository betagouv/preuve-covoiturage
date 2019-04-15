import { ActionInterface } from '../interfaces/ActionInterface';
import { ActionConstructorInterface } from '../interfaces/ActionConstructorInterface';
import { CallInterface } from '../interfaces/CallInterface';

export abstract class Provider {
    private actionInstance : Map<string, ActionInterface> = new Map();
    protected actions: ActionConstructorInterface[] = [];
    
    public boot() {
        this.actions.forEach(action => {
            const actionInstance = new action;
            this.actionInstance.set(actionInstance.signature, actionInstance);
        });
    }

    public resolve(call: CallInterface): CallInterface {
        if (!this.actionInstance.has(call.method)) {
            throw new Error('Unkmown method');
        }
        this.actionInstance.get(call.method).cast(call);
        return call;
    }

    public call(method: string, parameters: {[prop: string]: any}) {
        const result = {};
        this.resolve({
            method,
            parameters,
            result,
            context: {
                internal: true,
            },
        });
        return result;
    }
}