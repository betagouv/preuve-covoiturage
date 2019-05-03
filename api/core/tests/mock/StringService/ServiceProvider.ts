import { ServiceProvider as BaseServiceProvider } from '../../../src/parents/ServiceProvider';

import { HelloAction } from './actions/HelloAction';
import { ResultAction } from './actions/ResultAction';

export class ServiceProvider extends BaseServiceProvider {
  handlers = [
    HelloAction,
    ResultAction,
  ];
}
