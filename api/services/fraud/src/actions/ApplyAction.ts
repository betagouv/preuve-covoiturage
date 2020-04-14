import { Action } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver, InitHookInterface } from '@ilos/common';

import {
  signature as checkSignature,
  ParamsInterface as CheckParamsInterface,
} from '../shared/fraudcheck/check.contract';
import { handlerConfig, signature, ParamsInterface, ResultInterface } from '../shared/fraudcheck/apply.contract';
import { ProcessableCarpoolRepositoryProviderInterfaceResolver } from '../interfaces';
import { CheckEngine } from '../engine/CheckEngine';

/*
 * Run test on trip that doest have pass all yet
 */
@handler({
  ...handlerConfig,
  middlewares: [['channel.service.only', [handlerConfig.service]]],
})
export class ApplyAction extends Action implements InitHookInterface {
  constructor(
    private kernel: KernelInterfaceResolver,
    private engine: CheckEngine,
    private repository: ProcessableCarpoolRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  async init(): Promise<void> {
    await this.kernel.notify<ParamsInterface>(signature, null, {
      call: {
        user: {},
      },
      channel: {
        service: handlerConfig.service,
        metadata: {
          repeat: {
            cron: '0 4 * * *',
          },
          jobId: 'fraudcheck.apply',
        },
      },
    });
  }

  public async handle(_request: ParamsInterface, _context: ContextType): Promise<ResultInterface> {
    // refresh view
    await this.repository.refresh();

    // get cursor for acquistion_id to process
    const cursor = await this.repository.findProcessable();
    let done = false;
    do {
      const results = await cursor.next();
      done = results.done;
      if (results.value) {
        for (const { acquisition_id, processed_methods } of results.value) {
          // add check to queue
          await this.check(acquisition_id, this.listProcessableMethods(processed_methods));
        }
      }
    } while (!done);

    return;
  }

  protected async check(acquisition_id: number, methods: string[]): Promise<void> {
    await this.kernel.notify<CheckParamsInterface>(
      checkSignature,
      {
        acquisition_id,
        methods,
      },
      {
        call: {
          user: {},
        },
        channel: {
          service: handlerConfig.service,
        },
      },
    );
  }

  protected listProcessableMethods(processed_methods: string[]): string[] {
    const availableMethods = this.engine.listAvailableMethods();
    return availableMethods.filter((x) => !processed_methods.includes(x));
  }
}
