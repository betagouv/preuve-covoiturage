import { ServiceProvider as BaseServiceProvider } from '~/parents/ServiceProvider';
import { ActionConstructorInterface } from '~/interfaces/ActionConstructorInterface';
import { MiddlewareInterface } from '~/interfaces/MiddlewareInterface';
import { HelloAction } from './actions/HelloAction';
import { ResultAction } from './actions/ResultAction';

export class ServiceProvider extends BaseServiceProvider {
    public readonly signature: string = 'string';
    public readonly version: string = '0.0.1';

    protected actions: ActionConstructorInterface[] = [
        HelloAction,
        ResultAction,
    ];

    protected middlewares: MiddlewareInterface[] = [];
}
