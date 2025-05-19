import { router, serviceProvider } from "@/ilos/common/index.ts";
import { ServiceProvider as AbstractServiceProvider } from "@/ilos/core/index.ts";
import { defaultMiddlewareBindings } from "@/pdc/providers/middleware/index.ts";
import { ValidatorMiddleware } from "@/pdc/providers/superstruct/ValidatorMiddleware.ts";
import { TokenProvider } from "@/pdc/providers/token/index.ts";
import { ApplicationPgRepositoryProvider } from "@/pdc/services/application/providers/ApplicationPgRepositoryProvider.ts";
import { AccessTokenAction } from "@/pdc/services/auth/actions/AccessTokenAction.ts";
import { CreateAccessTokenAction } from "@/pdc/services/auth/actions/CreateAccessTokenAction.ts";
import { DeleteAccessTokenAction } from "@/pdc/services/auth/actions/DeleteAccessTokenAction.ts";
import { ListAccessTokenAction } from "@/pdc/services/auth/actions/ListAccessTokenAction.ts";
import { ProConnectOIDCProvider } from "@/pdc/services/auth/providers/ProConnectOIDCProvider.ts";
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
    ...defaultMiddlewareBindings
  ],
  handlers: [AccessTokenAction, ListAccessTokenAction, CreateAccessTokenAction, DeleteAccessTokenAction],
})
export class AuthServiceProvider extends AbstractServiceProvider {}
