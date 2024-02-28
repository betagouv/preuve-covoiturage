import { CommandExtension } from '@ilos/cli';
import { ExtensionInterface, NewableType, serviceProvider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { defaultMiddlewareBindings } from '@pdc/providers/middleware';
import { S3StorageProvider } from '@pdc/providers/storage';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/providers/validator';
import { CreateCommand } from './commands/CreateCommand';
import { DebugCommand } from './commands/DebugCommand';
import { ProcessCommand } from './commands/ProcessCommand';
import { config } from './config';
import { CampaignRepository } from './repositories/CampaignRepository';
import { CarpoolRepository } from './repositories/CarpoolRepository';
import { ExportRepository } from './repositories/ExportRepository';
import { LogRepository } from './repositories/LogRepository';
import { RecipientRepository } from './repositories/RecipientRepository';
import { BuildService } from './services/BuildService';
import { FieldService } from './services/FieldService';
import { LogService } from './services/LogService';
import { NameService } from './services/NameService';
import { RecipientService } from './services/RecipientService';
import { TerritoryService } from './services/TerritoryService';

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
