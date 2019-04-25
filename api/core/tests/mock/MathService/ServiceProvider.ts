import { ServiceProvider as BaseServiceProvider } from '~/parents/ServiceProvider';
import { ActionConstructorInterface } from '~/interfaces/ActionConstructorInterface';
import { MiddlewareInterface } from '~/interfaces/MiddlewareInterface';
import { AddAction } from './actions/AddAction';

export class ServiceProvider extends BaseServiceProvider {
    public readonly signature: string = 'math';
    public readonly version: string = '0.0.1';

    protected actions: ActionConstructorInterface[] = [
        AddAction,
    ];

    protected middlewares: MiddlewareInterface[] = [];
}
