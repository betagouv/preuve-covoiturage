import { ExtensionInterface, NewableType, serviceProvider } from '@/ilos/common/index.ts';
import { ServiceProvider as AbstractServiceProvider } from '@/ilos/core/index.ts';
import { CarpoolAcquisitionService } from '@/pdc/providers/carpool/index.ts';
import { GeoProvider } from '@/pdc/providers/geo/index.ts';
import { defaultMiddlewareBindings } from '@/pdc/providers/middleware/index.ts';
import { NormalizationProvider } from '@/pdc/providers/normalization/index.ts';
import { ValidatorExtension, ValidatorMiddleware } from '@/pdc/providers/validator/index.ts';
import { binding as cancelBinding } from '@/shared/acquisition/cancel.schema.ts';
import { v3binding } from '@/shared/acquisition/create.schema.ts';
import { binding as listBinding } from '@/shared/acquisition/list.schema.ts';
import { binding as patchBinding } from '@/shared/acquisition/patch.schema.ts';
import { binding as statusBinding } from '@/shared/acquisition/status.schema.ts';
import { CancelJourneyAction } from './actions/CancelJourneyAction.ts';
import { CreateJourneyAction } from './actions/CreateJourneyAction.ts';
import { ListJourneyAction } from './actions/ListJourneyAction.ts';
import { PatchJourneyAction } from './actions/PatchJourneyAction.ts';
import { ProcessJourneyAction } from './actions/ProcessJourneyAction.ts';
import { StatusJourneyAction } from './actions/StatusJourneyAction.ts';
import { AcquisitionProcessCommand } from './commands/AcquisitionProcessCommand.ts';
import { AcquisitionMigrateCommand } from './commands/MigrateAcquisitionCommand.ts';
import { ProcessGeoCommand } from './commands/ProcessGeoCommand.ts';
import { config } from './config/index.ts';
import { AcquisitionRepositoryProvider } from './providers/AcquisitionRepositoryProvider.ts';

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
