import { router, serviceProvider } from "@/ilos/common/index.ts";
import { ServiceProvider as AbstractServiceProvider } from "@/ilos/core/index.ts";
import { ValidatorMiddleware } from "@/pdc/providers/superstruct/ValidatorMiddleware.ts";
import { TokenProvider } from "@/pdc/providers/token/index.ts";
import { ApplicationPgRepositoryProvider } from "@/pdc/services/application/providers/ApplicationPgRepositoryProvider.ts";
import { AccessTokenAction } from "@/pdc/services/auth/actions/AccessTokenAction.ts";
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
  ],
  handlers: [AccessTokenAction],
})
export class AuthServiceProvider extends AbstractServiceProvider {}
