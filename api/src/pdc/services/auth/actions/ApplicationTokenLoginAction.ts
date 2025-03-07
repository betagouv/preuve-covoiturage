import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { ApplicationTokenLogin } from "@/pdc/services/auth/dto/ApplicationTokenLogin.ts";
import { OidcProvider } from "../providers/OidcProvider.ts";

export type ResultInterface = {
  access_token: string;
};

@handler({
  service: "auth",
  method: "applicationTokenLogin",
  middlewares: [
    ["validate", ApplicationTokenLogin],
  ],
  apiRoute: {
    method: "POST",
    path: "/auth/token",
  },
})
export class ApplicationTokenLoginAction extends AbstractAction {
  constructor(
    private oidcProvider: OidcProvider,
  ) {
    super();
  }

  public async handle(params: ApplicationTokenLogin): Promise<ResultInterface> {
    const token = await this.oidcProvider.getToken(params.access_key, params.secret_key);
    return { access_token: token };
  }
}
