import { handler } from "@/ilos/common/Decorators.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { AccessTokenParams, AccessTokenResult } from "../dto/AccessToken.ts";
import { DexOIDCProvider } from "../providers/DexOIDCProvider.ts";

@handler({
  service: "auth",
  method: "accessToken",
  middlewares: [
    ["validate", AccessTokenParams],
  ],
  apiRoute: {
    path: "/auth/access_token",
    method: "POST",
    rateLimiter: {
      key: "rl-auth",
      limit: 20,
      windowMinute: 1,
    },
    successHttpCode: 201,
  },
})
export class AccessTokenAction extends AbstractAction {
  constructor(
    private dexOIDCProvider: DexOIDCProvider,
  ) {
    super();
  }

  protected override async handle(params: AccessTokenParams): Promise<AccessTokenResult> {
    const { access_key, secret_key } = params;
    const access_token = await this.dexOIDCProvider.getToken(access_key, secret_key);
    return { access_token };
  }
}
