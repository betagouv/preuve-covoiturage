import { CommandExtension } from "@/ilos/cli/index.ts";
import { ExtensionInterface, NewableType, serviceProvider } from "@/ilos/common/index.ts";
import { ServiceProvider as AbstractServiceProvider } from "@/ilos/core/index.ts";
import { DefaultTimezoneMiddleware } from "@/pdc/middlewares/DefaultTimezoneMiddleware.ts";
import { defaultMiddlewareBindings } from "@/pdc/providers/middleware/index.ts";
import { S3StorageProvider } from "@/pdc/providers/storage/index.ts";
import { ValidatorExtension, ValidatorMiddleware } from "@/pdc/providers/validator/index.ts";
import { TerritoryRepository } from "@/pdc/services/export/repositories/TerritoryRepository.ts";
import { DataGouvService } from "@/pdc/services/export/services/DataGouvService.ts";
import { bindingV2 as createBindingV2, bindingV3 as createBindingV3 } from "@/shared/export/create.schema.ts";
import { CreateActionV2 } from "./actions/CreateActionV2.ts";
import { CreateActionV3 } from "./actions/CreateActionV3.ts";
import { CreateCommand } from "./commands/CreateCommand.ts";
import { DataGouvCommand } from "./commands/DataGouvCommand.ts";
import { ProcessCommand } from "./commands/ProcessCommand.ts";
import { config } from "./config/index.ts";
import { CampaignRepository } from "./repositories/CampaignRepository.ts";
import { CarpoolRepository } from "./repositories/CarpoolRepository.ts";
import { DataGouvRepository } from "./repositories/DataGouvRepository.ts";
import { ExportRepository } from "./repositories/ExportRepository.ts";
import { LogRepository } from "./repositories/LogRepository.ts";
import { RecipientRepository } from "./repositories/RecipientRepository.ts";
import { FieldService } from "./services/FieldService.ts";
import { FileCreatorService } from "./services/FileCreatorService.ts";
import { LogService } from "./services/LogService.ts";
import { NameService } from "./services/NameService.ts";
import { OpenDataFileCreatorService } from "./services/OpenDataFileCreatorService.ts";
import { RecipientService } from "./services/RecipientService.ts";
import { TerritoryService } from "./services/TerritoryService.ts";

// Services are from the ./services folder
// and are used to implement the business logic of the application.
// They are injected in commands and handlers.
const services = [
  DataGouvService,
  FieldService,
  FileCreatorService,
  LogService,
  NameService,
  OpenDataFileCreatorService,
  RecipientService,
  TerritoryService,
];

// Repositories are from the ./repositories folder
// and are used to access the database or other data sources.
const repositories = [
  CampaignRepository,
  CarpoolRepository,
  DataGouvRepository,
  ExportRepository,
  LogRepository,
  RecipientRepository,
  TerritoryRepository,
];

// External providers are from the @pdc namespace
const externalProviders = [S3StorageProvider];

// Commands are from the ./commands folder
// and are used to implement the CLI commands.
const commands = [CreateCommand, DataGouvCommand, ProcessCommand];

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
    ["validate", ValidatorMiddleware],
    ["timezone", DefaultTimezoneMiddleware],
    // scopeToGroupBinding,
  ],
})
export class ExportServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [
    CommandExtension,
    ValidatorExtension,
  ];
}
