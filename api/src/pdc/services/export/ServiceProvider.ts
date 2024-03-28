import { CommandExtension } from '@ilos/cli';
import { ExtensionInterface, NewableType, serviceProvider } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { defaultMiddlewareBindings } from '@pdc/providers/middleware';
import { S3StorageProvider } from '@pdc/providers/storage';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/providers/validator';
import { bindingV2 as createBindingV2, bindingV3 as createBindingV3 } from '@shared/export/create.schema';
import { CreateActionV2 } from './actions/CreateActionV2';
import { CreateActionV3 } from './actions/CreateActionV3';
import { CreateCommand } from './commands/CreateCommand';
import { DebugCommand } from './commands/DebugCommand';
import { ProcessCommand } from './commands/ProcessCommand';
import { config } from './config';
import { DefaultTimezoneMiddleware } from './middlewares/DefaultTimezoneMiddleware';
import { scopeToGroupBinding } from './middlewares/ScopeToGroupMiddleware';
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
const services = [
  BuildService,
  FieldService,
  NameService,
  TerritoryService,
  LogService,
  RecipientService,
];

// Repositories are from the ./repositories folder
// and are used to access the database or other data sources.
const repositories = [
  ExportRepository,
  RecipientRepository,
  CampaignRepository,
  CarpoolRepository,
  LogRepository,
];

// External providers are from the @pdc namespace
const externalProviders = [S3StorageProvider];

// Commands are from the ./commands folder
// and are used to implement the CLI commands.
const commands = [DebugCommand, CreateCommand, ProcessCommand];

// Handlers are from the ./actions folder
// and are used to implement the API endpoints (also called actions).
const handlers = [CreateActionV2, CreateActionV3];

// Validator bindings are from the @shared/export/*.schema.ts files
// and are used to validate the input data using JSON Schema.
const validators = [createBindingV2, createBindingV3];

@serviceProvider({
  config,
  commands,
  handlers,
  providers: [...externalProviders, ...repositories, ...services],
  validator: [...validators],
  middlewares: [
    ...defaultMiddlewareBindings,
    ['validate', ValidatorMiddleware],
    ['timezone', DefaultTimezoneMiddleware],
    // scopeToGroupBinding,
  ],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [
    CommandExtension,
    ValidatorExtension,
  ];
}
