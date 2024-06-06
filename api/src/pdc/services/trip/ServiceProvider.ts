import { CommandExtension } from '@/ilos/cli/index.ts';
import { ExtensionInterface, NewableType, serviceProvider } from '@/ilos/common/index.ts';
import { ServiceProvider as AbstractServiceProvider } from '@/ilos/core/index.ts';
import { CryptoProvider } from '@/pdc/providers/crypto/index.ts';
import { defaultMiddlewareBindings } from '@/pdc/providers/middleware/index.ts';
import { APDFNameProvider, S3StorageProvider } from '@/pdc/providers/storage/index.ts';
import { ValidatorExtension, ValidatorMiddleware } from '@/pdc/providers/validator/index.ts';
import { BuildExportAction } from './actions/BuildExportAction.ts';
import { ExportAction } from './actions/ExportAction.ts';
import { FinancialStatsAction } from './actions/FinancialStatsAction.ts';
import { ListTripsAction } from './actions/ListTripsAction.ts';
import { PublishOpenDataAction } from './actions/PublishOpenDataAction.ts';
import { SearchCountAction } from './actions/SearchCountAction.ts';
import { SendExportAction } from './actions/SendExportAction.ts';
import { StatsAction } from './actions/StatsAction.ts';
import { PublishOpendataCommand } from './commands/PublishOpendataCommand.ts';
import { ReplayOpendataExportCommand } from './commands/ReplayOpendataExportCommand.ts';
import { config } from './config/index.ts';
import { scopeToGroupBinding } from './middleware/ScopeToGroupMiddleware.ts';
import { DataGouvProvider } from './providers/DataGouvProvider.ts';
import { StatCacheRepositoryProvider } from './providers/StatCacheRepositoryProvider.ts';
import { TripRepositoryProvider } from './providers/TripRepositoryProvider.ts';
import { binding as buildExportBinding } from '@/shared/trip/buildExport.schema.ts';
import { binding as exportBinding } from '@/shared/trip/export.schema.ts';
import { binding as listBinding } from '@/shared/trip/listTrips.schema.ts';
import { binding as publishOpenDataBinding } from '@/shared/trip/publishOpenData.schema.ts';
import { binding as searchCountBinding } from '@/shared/trip/searchcount.schema.ts';
import { binding as sendExportBinding } from '@/shared/trip/sendExport.schema.ts';
import { binding as statsBinding } from '@/shared/trip/stats.schema.ts';

@serviceProvider({
  config,
  providers: [
    APDFNameProvider,
    CryptoProvider,
    DataGouvProvider,
    S3StorageProvider,
    StatCacheRepositoryProvider,
    TripRepositoryProvider,
  ],
  validator: [
    listBinding,
    searchCountBinding,
    statsBinding,
    exportBinding,
    buildExportBinding,
    sendExportBinding,
    publishOpenDataBinding,
  ],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware], scopeToGroupBinding],
  commands: [ReplayOpendataExportCommand, PublishOpendataCommand],
  handlers: [
    ListTripsAction,
    SearchCountAction,
    StatsAction,
    FinancialStatsAction,
    ExportAction,
    BuildExportAction,
    SendExportAction,
    PublishOpenDataAction,
  ],
  queues: ['trip'],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [CommandExtension, ValidatorExtension];
}
