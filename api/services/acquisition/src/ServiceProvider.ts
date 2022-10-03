import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { defaultMiddlewareBindings } from '@pdc/provider-middleware';
import { NormalizationProvider } from '@pdc/provider-normalization';
import { GeoProvider } from '@pdc/provider-geo';

import { config } from './config';
import { AcquisitionRepositoryProvider } from './providers/AcquisitionRepositoryProvider';

import { create } from './shared/acquisition/create.schema';
import { cancel } from './shared/acquisition/cancel.schema';
import { status } from './shared/acquisition/status.schema';

import { CreateJourneyAction } from './actions/CreateJourneyAction';
import { CancelJourneyAction } from './actions/CancelJourneyAction';
import { StatusJourneyAction } from './actions/StatusJourneyAction';
import { ProcessJourneyAction } from './actions/ProcessJourneyAction';

@serviceProvider({
  config,
  queues: ['acquisition'],
  providers: [AcquisitionRepositoryProvider, NormalizationProvider, GeoProvider],
  validator: [
    ['journey.create', create],
    ['journey.cancel', cancel],
    ['journey.status', status],
  ],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware]],
  connections: [
    [PostgresConnection, 'connections.postgres'],
    [RedisConnection, 'connections.redis'],
  ],
  handlers: [CreateJourneyAction, CancelJourneyAction, StatusJourneyAction, ProcessJourneyAction],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
