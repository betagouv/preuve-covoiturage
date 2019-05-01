import { ServiceProvider as BaseServiceProvider } from '~/parents/ServiceProvider';

import { AddAction } from './actions/AddAction';

export class ServiceProvider extends BaseServiceProvider {
  handlers = [
    AddAction,
  ];
}
