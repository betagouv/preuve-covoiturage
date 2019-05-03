import { ServiceProvider as ParentServiceProvider } from '@pdc/core';
import { HelloAction } from './actions/HelloAction';

export class ServiceProvider extends ParentServiceProvider {
  handlers = [
    HelloAction,
  ]
}