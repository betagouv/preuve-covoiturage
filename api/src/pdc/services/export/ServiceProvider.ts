import { CommandExtension } from '@ilos/cli/index.ts';
import { ExtensionInterface, NewableType, serviceProvider } from '@ilos/common/index.ts';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core/index.ts';
import { defaultMiddlewareBindings } from '@pdc/providers/middleware/index.ts';
import { S3StorageProvider } from '@pdc/providers/storage/index.ts';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/providers/validator/index.ts';
import { CreateCommand } from './commands/CreateCommand.ts';
import { DebugCommand } from './commands/DebugCommand.ts';
import { ProcessCommand } from './commands/ProcessCommand.ts';
import { config } from './config/index.ts';
import { CampaignRepository } from './repositories/CampaignRepository.ts';
import { CarpoolRepository } from './repositories/CarpoolRepository.ts';
import { ExportRepository } from './repositories/ExportRepository.ts';
import { LogRepository } from './repositories/LogRepository.ts';
import { RecipientRepository } from './repositories/RecipientRepository.ts';
import { BuildService } from './services/BuildService.ts';
import { FieldService } from './services/FieldService.ts';
import { LogService } from './services/LogService.ts';
import { NameService } from './services/NameService.ts';
import { RecipientService } from './services/RecipientService.ts';
import { TerritoryService } from './services/TerritoryService.ts';

// Services are from the ./services folder
// and are used to implement the business logic of the application.
// They are injected in commands and handlers.
const services = [BuildService, FieldService, NameService, TerritoryService, LogService, RecipientService];

// Repositories are from the ./repositories folder
// and are used to access the database or other data sources.
const repositories = [ExportRepository, RecipientRepository, CampaignRepository, CarpoolRepository, LogRepository];

// External providers are from the @pdc namespace
const externalProviders = [S3StorageProvider];

// Commands are from the ./commands folder
// and are used to implement the CLI commands.
const commands = [DebugCommand, CreateCommand, ProcessCommand];

// Handlers are from the ./handlers folder
// and are used to implement the API endpoints (also called actions).
const handlers = [];

@serviceProvider({
  config,
  commands,
  handlers,
  providers: [...externalProviders, ...repositories, ...services],
  validator: [],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware]],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [CommandExtension, ValidatorExtension];
}
