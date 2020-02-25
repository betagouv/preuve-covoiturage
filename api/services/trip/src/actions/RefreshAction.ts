import { Action } from '@ilos/core';
import { handler, ContextType, InitHookInterface, KernelInterfaceResolver } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/refresh.contract';

@handler({ ...handlerConfig, middlewares: [['channel.service.only', [handlerConfig.service]]] })
export class RefreshAction extends Action implements InitHookInterface {
  constructor(private pg: PostgresConnection, private kernel: KernelInterfaceResolver) {
    super();
  }

  async init(): Promise<void> {
    await this.kernel.notify('trip:refresh', 'list', {
      call: {
        user: {},
      },
      channel: {
        service: 'trip',
        metadata: {
          repeat: {
            cron: '0 1 * * *',
          },
          jobId: 'trip.refresh_view.list',
        },
      },
    });

    await this.kernel.notify('trip:refresh', 'export', {
      call: {
        user: {},
      },
      channel: {
        service: 'trip',
        metadata: {
          repeat: {
            cron: '0 2 * * *',
          },
          jobId: 'trip.refresh_view.export',
        },
      },
    });
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    switch (params) {
      case 'list':
        await this.pg.getClient().query(`REFRESH MATERIALIZED VIEW trip.list`);
        return;
      case 'export':
        await this.pg.getClient().query(`REFRESH MATERIALIZED VIEW trip.export`);
        return;
    }
  }
}
