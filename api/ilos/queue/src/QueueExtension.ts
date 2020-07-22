import {
  RegisterHookInterface,
  InitHookInterface,
  ServiceContainerInterface,
  HandlerInterface,
  NewableType,
  QueueConfigType,
  QueueTargetType,
  extension,
} from '@ilos/common';
import { env } from '@ilos/core';
import { Extensions } from '@ilos/core';
import { queueHandlerFactory } from '@ilos/handler-redis';

@extension({
  name: 'queues',
  require: [Extensions.Config, Extensions.Handlers],
})
export class QueueExtension implements RegisterHookInterface, InitHookInterface {
  static get containerKey() {
    return Symbol.for('queues:handlers');
  }

  protected isWorker = false;

  constructor(protected config: QueueConfigType | QueueTargetType[]) {}

  register(serviceContainer: ServiceContainerInterface) {
    const targets = this.filterTargets(
      [...(Array.isArray(this.config) ? this.config : this.config.for)],
      serviceContainer,
    );

    this.registerQueue(targets, serviceContainer);
  }

  async init(serviceContainer: ServiceContainerInterface) {
    if (env('APP_WORKER', false)) {
      this.isProcessable(serviceContainer);
    }
  }

  protected isProcessable(serviceContainer: ServiceContainerInterface) {
    const rootContainer = serviceContainer.getContainer().root;
    const registredHandlers = Array.from(
      new Set(
        rootContainer
          .getHandlers()
          .filter((cfg) => 'local' in cfg && cfg.local && 'queue' in cfg && !cfg.queue)
          .map((cfg) => cfg.service),
      ),
    );
    const targets = rootContainer.getAll<string>(QueueExtension.containerKey);
    const unprocessableTargets = targets.filter((service: string) => registredHandlers.indexOf(service) < 0);

    if (unprocessableTargets.length > 0) {
      throw new Error(`Unprocessable queue listeners: ${unprocessableTargets.join(', ')}`);
    }
  }

  protected filterTargets(targets: QueueTargetType[], serviceContainer: ServiceContainerInterface): QueueTargetType[] {
    const rootContainer = serviceContainer.getContainer().root;

    let registredQueues: QueueTargetType[] = [];
    if (rootContainer.isBound(QueueExtension.containerKey)) {
      registredQueues = rootContainer.getAll<QueueTargetType>(QueueExtension.containerKey);
    }
    return targets.filter((target) => {
      // if already registred, filter it
      if (registredQueues.indexOf(target) !== -1) {
        return false;
      }
      return true;
    });
  }

  protected registerQueue(targets: QueueTargetType[], serviceContainer: ServiceContainerInterface) {
    for (const target of targets) {
      serviceContainer.getContainer().root.bind(QueueExtension.containerKey).toConstantValue(target);
    }
    this.registerQueueHandlers(targets, serviceContainer);
  }

  protected registerQueueHandlers(targets: QueueTargetType[], serviceContainer: ServiceContainerInterface) {
    for (const target of targets) {
      const handler: NewableType<HandlerInterface> = queueHandlerFactory(target);
      serviceContainer.getContainer().setHandler(handler);
      serviceContainer.registerHooks(handler.prototype, handler);
    }
  }
}
