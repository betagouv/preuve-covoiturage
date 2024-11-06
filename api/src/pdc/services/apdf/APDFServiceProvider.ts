import { ExtensionInterface, NewableType, serviceProvider } from "@/ilos/common/index.ts";
import { ServiceProvider as AbstractServiceProvider } from "@/ilos/core/index.ts";
import { defaultMiddlewareBindings } from "@/pdc/providers/middleware/index.ts";
import { APDFNameProvider, S3StorageProvider } from "@/pdc/providers/storage/index.ts";
import { ValidatorExtension, ValidatorMiddleware } from "@/pdc/providers/validator/index.ts";

import { binding as exportBinding } from "@/shared/apdf/export.schema.ts";
import { binding as listBinding } from "@/shared/apdf/list.schema.ts";
import { config } from "./config/index.ts";
import { DataRepositoryProvider } from "./providers/APDFRepositoryProvider.ts";
import { StorageRepositoryProvider } from "./providers/StorageRepositoryProvider.ts";

import { ExportAction } from "./actions/ExportAction.ts";
import { ListAction } from "./actions/ListAction.ts";
import { ExportCommand } from "./commands/ExportCommand.ts";

@serviceProvider({
  config,
  validator: [listBinding, exportBinding],
  providers: [
    APDFNameProvider,
    DataRepositoryProvider,
    S3StorageProvider,
    StorageRepositoryProvider,
  ],
  handlers: [ListAction, ExportAction],
  commands: [ExportCommand],
  middlewares: [...defaultMiddlewareBindings, [
    "validate",
    ValidatorMiddleware,
  ]],
})
export class APDFServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
