import { ServiceProvider as BaseServiceProvider } from '/ilos/core/index.ts';
import { serviceProvider } from '/ilos/common/index.ts';

import { AddAction } from './actions/AddAction.ts';
import { CustomProvider } from '../Providers/CustomProvider.ts';

@serviceProvider({
  providers: [CustomProvider],
  handlers: [AddAction],
})
export class ServiceProvider extends BaseServiceProvider {
  async init() {
    await super.init();
    this.getContainer().get(CustomProvider).set('math:');
  }
}
