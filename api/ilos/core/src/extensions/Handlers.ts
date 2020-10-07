import {
  RegisterHookInterface,
  NewableType,
  ServiceContainerInterface,
  HandlerInterface,
  extension,
} from '@ilos/common';

import { Middlewares } from './Middlewares';

@extension({
  name: 'handlers',
  require: [Middlewares],
})
export class Handlers implements RegisterHookInterface {
  constructor(protected readonly handlers: NewableType<HandlerInterface>[]) {
    //
  }

  public async register(serviceContainer: ServiceContainerInterface): Promise<void> {
    for (const handler of this.handlers) {
      serviceContainer.getContainer().setHandler(handler);
      serviceContainer.registerHooks(handler.prototype, handler);
    }
  }
}
