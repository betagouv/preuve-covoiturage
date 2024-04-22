import { ExtensionInterface, NewableType, serviceProvider } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { CarpoolAcquisitionService } from '@pdc/providers/carpool';
import { GeoProvider } from '@pdc/providers/geo';
import { defaultMiddlewareBindings } from '@pdc/providers/middleware';
import { NormalizationProvider } from '@pdc/providers/normalization';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/providers/validator';
import { binding as cancelBinding } from '@shared/acquisition/cancel.schema';
import { v3binding } from '@shared/acquisition/create.schema';
import { binding as listBinding } from '@shared/acquisition/list.schema';
import { binding as patchBinding } from '@shared/acquisition/patch.schema';
import { binding as statusBinding } from '@shared/acquisition/status.schema';
import { CancelJourneyAction } from './actions/CancelJourneyAction';
import { CreateJourneyAction } from './actions/CreateJourneyAction';
import { ListJourneyAction } from './actions/ListJourneyAction';
import { PatchJourneyAction } from './actions/PatchJourneyAction';
import { ProcessJourneyAction } from './actions/ProcessJourneyAction';
import { StatusJourneyAction } from './actions/StatusJourneyAction';
import { AcquisitionProcessCommand } from './commands/AcquisitionProcessCommand';
import { AcquisitionMigrateCommand } from './commands/MigrateAcquisitionCommand';
import { ProcessGeoCommand } from './commands/ProcessGeoCommand';
import { config } from './config';
import { AcquisitionRepositoryProvider } from './providers/AcquisitionRepositoryProvider';

@serviceProvider({
  config,
  commands: [AcquisitionProcessCommand, AcquisitionMigrateCommand, ProcessGeoCommand],
  queues: ['acquisition'],
  providers: [AcquisitionRepositoryProvider, NormalizationProvider, GeoProvider, CarpoolAcquisitionService],
  validator: [v3binding, listBinding, cancelBinding, statusBinding, patchBinding],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware]],
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
