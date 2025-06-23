import { handler } from "@/ilos/common/Decorators.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { copyFromContextMiddleware } from "@/pdc/providers/middleware/middlewares.ts";
import { CreateAccessTokenParams, CreateAccessTokenResult } from "../dto/Credentials.ts";
import { DexOIDCProvider } from "../providers/DexOIDCProvider.ts";

@handler({
  service: "auth",
  method: "accessToken",
  middlewares: [
    copyFromContextMiddleware(`call.user.operator_id`, "operator_id", false),
    ["validate", CreateAccessTokenParams],
  ],
  apiRoute: {
    path: "/auth/access_token",
    method: "POST",
    public: true,
    rateLimiter: {
      key: "rl-auth",
      limit: 20,
      windowMinute: 1,
    },
    successHttpCode: 201,
    rpcAnswerOnFailure: true,
  },
})
export class CreateAccessTokenAction extends AbstractAction {
  constructor(private dexOIDCProvider: DexOIDCProvider) {
    super();
  }

  protected override async handle(params: CreateAccessTokenParams): Promise<CreateAccessTokenResult> {
    const { access_key, secret_key } = params;
    const access_token = await this.dexOIDCProvider.getToken(access_key, secret_key);
    return { access_token };
  }
}
