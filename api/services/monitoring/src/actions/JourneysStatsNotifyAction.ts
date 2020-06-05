import { Action } from '@ilos/core';
import {
  handler,
  ContextType,
  InitHookInterface,
  KernelInterfaceResolver,
  ConfigInterfaceResolver,
} from '@ilos/common';
import { NotificationInterfaceResolver } from '@pdc/provider-notification';

import {
  handlerConfig,
  ResultInterface,
  ParamsInterface,
  signature,
} from '../shared/monitoring/journeys/notifyStats.contract';
import {
  signature as statsSignature,
  ResultInterface as StatsResultInterface,
  ParamsInterface as StatsParamsInterface,
} from '../shared/monitoring/journeys/stats.contract';

@handler({ ...handlerConfig, middlewares: [['channel.service.only', [handlerConfig.service]]] })
export class JourneysStatsNotifyAction extends Action implements InitHookInterface {
  constructor(
    private kernel: KernelInterfaceResolver,
    private notify: NotificationInterfaceResolver,
    private config: ConfigInterfaceResolver,
  ) {
    super();
  }

  async init(): Promise<void> {
    await this.kernel.notify(signature, undefined, {
      call: {
        user: {},
      },
      channel: {
        service: handlerConfig.service,
        metadata: {
          repeat: {
            cron: '0 6 * * *',
          },
          jobId: 'monitoring.journeys_stats',
        },
      },
    });
  }

  public async handle(_params: ParamsInterface, _context: ContextType): Promise<ResultInterface> {
    const { email, fullname, fromDays } = this.config.get('notification');

    const data = await this.kernel.call<StatsParamsInterface, StatsResultInterface>(statsSignature, fromDays, {
      call: {
        user: {
          permissions: ['monitoring.journeysstats'],
        },
      },
      channel: {
        service: handlerConfig.service,
      },
    });

    await this.notify.sendTemplateByEmail({
      email,
      fullname,
      template: 'stats',
      opts: {
        ...data.pipeline,
        last_missing_by_date: data.pipeline.last_missing_by_date.map((d) => ({ ...d, date: d.date.toDateString() })),
      },
    });
  }
}
