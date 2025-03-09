import { router, serviceProvider } from "@/ilos/common/index.ts";
import { ServiceProvider as AbstractServiceProvider } from "@/ilos/core/index.ts";
import { ValidatorMiddleware } from "@/pdc/providers/superstruct/ValidatorMiddleware.ts";
import { TokenProvider } from "@/pdc/providers/token/index.ts";
import { ApplicationPgRepositoryProvider } from "@/pdc/services/application/providers/ApplicationPgRepositoryProvider.ts";
import { OIDCCallbackAction } from "./actions/OIDCCallbackAction.ts";
import { AuthRouter } from "./AuthRouter.ts";
import { config } from "./config/index.ts";
import { OIDCProvider } from "./providers/OIDCProvider.ts";
import { UserRepository } from "./providers/UserRepository.ts";

@serviceProvider({
  config,
  providers: [
    UserRepository,
    OIDCProvider,
    [router, AuthRouter],
    // TODO : clean me after migration
    ApplicationPgRepositoryProvider,
    TokenProvider,
  ],
  middlewares: [
    ["validate", ValidatorMiddleware],
  ],
  handlers: [OIDCCallbackAction],
})
export class AuthServiceProvider extends AbstractServiceProvider {}
