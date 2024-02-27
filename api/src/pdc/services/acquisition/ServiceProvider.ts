import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/providers/validator';
import { defaultMiddlewareBindings } from '@pdc/providers/middleware';
import { NormalizationProvider } from '@pdc/providers/normalization';
import { GeoProvider } from '@pdc/providers/geo';

import { config } from './config';
import { AcquisitionRepositoryProvider } from './providers/AcquisitionRepositoryProvider';

import { v3binding } from '@shared/acquisition/create.schema';
import { binding as cancelBinding } from '@shared/acquisition/cancel.schema';
import { binding as statusBinding } from '@shared/acquisition/status.schema';
import { binding as listBinding } from '@shared/acquisition/list.schema';
import { binding as patchBinding } from '@shared/acquisition/patch.schema';

import { AcquisitionProcessCommand } from './commands/AcquisitionProcessCommand';
import { CreateJourneyAction } from './actions/CreateJourneyAction';
import { CancelJourneyAction } from './actions/CancelJourneyAction';
import { StatusJourneyAction } from './actions/StatusJourneyAction';
import { ProcessJourneyAction } from './actions/ProcessJourneyAction';
import { ListJourneyAction } from './actions/ListJourneyAction';
import { PatchJourneyAction } from './actions/PatchJourneyAction';
import { CarpoolAcquisitionService } from '@pdc/providers/carpool';

@serviceProvider({
  config,
  commands: [AcquisitionProcessCommand],
  queues: ['acquisition'],
  providers: [AcquisitionRepositoryProvider, NormalizationProvider, GeoProvider, CarpoolAcquisitionService],
  validator: [v3binding, listBinding, cancelBinding, statusBinding, patchBinding],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware]],
  connections: [
    [PostgresConnection, 'connections.postgres'],
    [RedisConnection, 'connections.redis'],
  ],
  handlers: [
    CreateJourneyAction,
    CancelJourneyAction,
    StatusJourneyAction,
    ProcessJourneyAction,
    ListJourneyAction,
    PatchJourneyAction,
  ],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
