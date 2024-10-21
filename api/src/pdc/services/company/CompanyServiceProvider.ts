import { ExtensionInterface, NewableType, serviceProvider } from "@/ilos/common/index.ts";
import { ServiceProvider as AbstractServiceProvider } from "@/ilos/core/index.ts";
import { defaultMiddlewareBindings } from "@/pdc/providers/middleware/index.ts";
import { ValidatorExtension, ValidatorMiddleware } from "@/pdc/providers/validator/index.ts";

import { FetchCommand } from "@/pdc/services/company/commands/FetchCommand.ts";
import { binding as fetchBinding } from "@/shared/company/fetch.schema.ts";
import { binding as findBinding } from "@/shared/company/find.schema.ts";
import { FetchAction } from "./actions/FetchAction.ts";
import { FindAction } from "./actions/FindAction.ts";
import { config } from "./config/index.ts";
import { CompanyDataSourceProvider } from "./providers/CompanyDataSourceProvider.ts";
import { CompanyRepositoryProvider } from "./providers/CompanyRepositoryProvider.ts";

@serviceProvider({
  config,
  providers: [CompanyRepositoryProvider, CompanyDataSourceProvider],
  validator: [fetchBinding, findBinding],
  middlewares: [...defaultMiddlewareBindings, [
    "validate",
    ValidatorMiddleware,
  ]],
  handlers: [FetchAction, FindAction],
  commands: [FetchCommand],
})
export class CompanyServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
