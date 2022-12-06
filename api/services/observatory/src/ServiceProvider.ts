import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { defaultMiddlewareBindings } from '@pdc/provider-middleware';

import { config } from './config';
import { FluxRepositoryProvider } from './providers/FluxRepositoryProvider';
import { binding as MonthlyFluxBinding } from './shared/observatory/flux/monthlyFlux.schema';
import { MonthlyFluxAction } from './actions/MonthlyFluxAction';
import { LastRecordMonthlyFluxAction } from './actions/LastRecordMonthlyFluxAction';
import { InsertLastMonthFluxAction } from './actions/InsertLastMonthFluxAction';
import { RefreshAllFluxAction } from './actions/RefreshAllFluxAction';
import { OccupationRepositoryProvider } from './providers/OccupationRepositoryProvider';
import { binding as MonthlyOccupationBinding } from './shared/observatory/occupation/monthlyOccupation.schema';
import { MonthlyOccupationAction } from './actions/MonthlyOccupationAction';
import { InsertLastMonthOccupationAction } from './actions/InsertLastMonthOccupationAction';
import { RefreshAllOccupationAction } from './actions/RefreshAllOccupationAction';

@serviceProvider({
  config,
  commands: [],
  providers: [
    FluxRepositoryProvider,
    OccupationRepositoryProvider,
  ],
  validator: [
    MonthlyFluxBinding,
    MonthlyOccupationBinding,
  ],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware]],
  connections: [
    [RedisConnection, 'connections.redis'],
    [PostgresConnection, 'connections.postgres'],
  ],
  handlers: [
    InsertLastMonthFluxAction,
    RefreshAllFluxAction,
    MonthlyFluxAction,
    LastRecordMonthlyFluxAction,
    MonthlyOccupationAction,
    InsertLastMonthOccupationAction,
    RefreshAllOccupationAction,
  ],
  queues: ['observatory']
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
