import { router, serviceProvider } from "@/ilos/common/index.ts";
import { ServiceProvider as AbstractServiceProvider } from "@/ilos/core/index.ts";
import { ValidatorMiddleware } from "@/pdc/providers/superstruct/ValidatorMiddleware.ts";

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
  ],
  middlewares: [
    ["validate", ValidatorMiddleware],
  ],
  handlers: [OidcCallbackAction],
})
export class AuthServiceProvider extends AbstractServiceProvider {}
