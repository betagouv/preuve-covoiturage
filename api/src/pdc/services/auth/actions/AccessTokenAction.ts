import { handler } from "@/ilos/common/Decorators.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { AccessTokenParams, AccessTokenResult } from "../dto/AccessToken.ts";
import { OIDCProvider } from "../providers/OIDCProvider.ts";

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
    private OIDCProvider: OIDCProvider,
  ) {
    super();
  }

  protected override async handle(params: AccessTokenParams): Promise<AccessTokenResult> {
    const { username, password } = params;
    const access_token = await this.OIDCProvider.getToken(username, password);
    return { access_token };
  }
}
