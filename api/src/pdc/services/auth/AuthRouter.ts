import { ConfigInterfaceResolver, inject, injectable, proxy } from "@/ilos/common/index.ts";
import { asyncHandler } from "@/pdc/proxy/helpers/asyncHandler.ts";
import { OidcCallbackAction } from "@/pdc/services/auth/actions/OidcCallbackAction.ts";
import { OidcProvider } from "@/pdc/services/auth/providers/OidcProvider.ts";
import express, { NextFunction, Request, Response } from "dep:express";

@injectable()
export class AuthRouter {
  constructor(
    @inject(proxy) private app: express.Express,
    private oidcProvider: OidcProvider,
    private oidcCallbackAction: OidcCallbackAction,
    private config: ConfigInterfaceResolver,
  ) {}

  register() {
    this.app.get("/auth/login", (req: Request, res: Response, _next: NextFunction) => {
      return res.redirect(this.oidcProvider.getLoginUrl());
    });

    this.app.get(
      "/auth/callback",
      asyncHandler(async (req: Request, res: Response) => {
        const { code } = req.query;
        if (typeof code === "string") {
          const user = await this.oidcCallbackAction.handle({ code });
          req.session.user = user;
        }
        return res.redirect(this.config.get("oidc.app_url"));
      }),
    );
  }
}
