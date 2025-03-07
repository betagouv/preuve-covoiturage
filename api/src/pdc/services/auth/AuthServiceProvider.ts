import { router, serviceProvider } from "@/ilos/common/index.ts";
import { ServiceProvider as AbstractServiceProvider } from "@/ilos/core/index.ts";
import { ValidatorMiddleware } from "@/pdc/providers/superstruct/ValidatorMiddleware.ts";

import { TokenProvider } from "@/pdc/providers/token/index.ts";
import { ApplicationPgRepositoryProvider } from "@/pdc/services/application/providers/ApplicationPgRepositoryProvider.ts";
import { ApplicationTokenLoginAction } from "@/pdc/services/auth/actions/ApplicationTokenLoginAction.ts";
import { OidcProvider } from "@/pdc/services/auth/providers/OidcProvider.ts";
import { OidcCallbackAction } from "./actions/OidcCallbackAction.ts";
import { AuthRouter } from "./AuthRouter.ts";
import { config } from "./config/index.ts";
import { UserRepository } from "./providers/UserRepository.ts";

@serviceProvider({
  config,
  providers: [
    UserRepository,
    OidcProvider,
    [router, AuthRouter],
    // TODO : clean me after migration
    ApplicationPgRepositoryProvider,
    TokenProvider,
  ],
  middlewares: [
    ["validate", ValidatorMiddleware],
  ],
  handlers: [OidcCallbackAction, ApplicationTokenLoginAction],
})
export class AuthServiceProvider extends AbstractServiceProvider {}
