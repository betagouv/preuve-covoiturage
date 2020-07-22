import { ServiceProvider as BaseServiceProvider } from '@ilos/core';
import { serviceProvider } from '@ilos/common';

import { AddAction } from './actions/AddAction';
import { CustomProvider } from '../Providers/CustomProvider';

@serviceProvider({
  providers: [CustomProvider],
  handlers: [AddAction],
})
export class ServiceProvider extends BaseServiceProvider {
  async init() {
    await super.init();
    this.getContainer()
      .get(CustomProvider)
      .set('math:');
  }
}
