import { router, serviceProvider } from "@/ilos/common/index.ts";
import { ServiceProvider as AbstractServiceProvider } from "@/ilos/core/index.ts";
import { defaultMiddlewareBindings } from "@/pdc/providers/middleware/index.ts";
import { ValidatorMiddleware } from "@/pdc/providers/superstruct/ValidatorMiddleware.ts";
import { TokenProvider } from "@/pdc/providers/token/index.ts";
import { ApplicationPgRepositoryProvider } from "@/pdc/services/application/providers/ApplicationPgRepositoryProvider.ts";
import { ProConnectOIDCProvider } from "@/pdc/services/auth/providers/ProConnectOIDCProvider.ts";
import { CreateAccessTokenAction } from "./actions/CreateAccessTokenAction.ts";
import { CreateCredentialsAction } from "./actions/CreateCredentialsAction.ts";
import { DeleteCredentialsAction } from "./actions/DeleteCredentialsAction.ts";
import { ReadCredentialsAction } from "./actions/ReadCredentialsAction.ts";
import { AuthRouter } from "./AuthRouter.ts";
import { config } from "./config/index.ts";
import { DexOIDCProvider } from "./providers/DexOIDCProvider.ts";
import { UserRepository } from "./providers/UserRepository.ts";

@serviceProvider({
  config,
  providers: [
    UserRepository,
    DexOIDCProvider,
    ProConnectOIDCProvider,
    [router, AuthRouter],
    // TODO : clean me after migration
    ApplicationPgRepositoryProvider,
    TokenProvider,
  ],
  middlewares: [
    ["validate", ValidatorMiddleware],
    ...defaultMiddlewareBindings,
  ],
  handlers: [CreateAccessTokenAction, ReadCredentialsAction, CreateCredentialsAction, DeleteCredentialsAction],
})
export class AuthServiceProvider extends AbstractServiceProvider {}
