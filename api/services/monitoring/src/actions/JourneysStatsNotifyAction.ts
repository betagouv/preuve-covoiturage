import { Action } from '@ilos/core';
import {
  handler,
  ContextType,
  InitHookInterface,
  KernelInterfaceResolver,
  ConfigInterfaceResolver,
} from '@ilos/common';
import {
  MailTemplateNotificationInterface,
  NotificationTransporterInterfaceResolver,
} from '@pdc/provider-notification';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';

import {
  handlerConfig,
  ResultInterface,
  ParamsInterface,
  signature,
} from '../shared/monitoring/notifyStats.contract';
import {
  signature as statsSignature,
  ResultInterface as StatsResultInterface,
  ParamsInterface as StatsParamsInterface,
} from '../shared/monitoring/journeystats.contract';
import { StatNotification } from '../notifications/StatNotification';

@handler({ ...handlerConfig, middlewares: [...internalOnlyMiddlewares(handlerConfig.service)] })
export class JourneysStatsNotifyAction extends Action implements InitHookInterface {
  constructor(
    private kernel: KernelInterfaceResolver,
    private notificationProvider: NotificationTransporterInterfaceResolver<MailTemplateNotificationInterface>,
    private config: ConfigInterfaceResolver,
  ) {
    super();
  }

  async init(): Promise<void> {
    /**
     * Activate daily statistics in production only
     */
    if (this.config.get('app.environment') === 'production') {
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

    await this.notificationProvider.send(new StatNotification(`${fullname} <${email}>`, data.pipeline));
  }
}
