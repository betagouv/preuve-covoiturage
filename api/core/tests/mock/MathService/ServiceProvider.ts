import { ServiceProvider as BaseServiceProvider } from '../../../src/parents/ServiceProvider';

import { AddAction } from './actions/AddAction';

export class ServiceProvider extends BaseServiceProvider {
  handlers = [AddAction];
}
