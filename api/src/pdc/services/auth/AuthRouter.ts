import { ConfigInterfaceResolver, inject, injectable, proxy } from "@/ilos/common/index.ts";
import { asyncHandler } from "@/pdc/proxy/helpers/asyncHandler.ts";
import express, { NextFunction, Request, Response } from "dep:express";
import { OIDCCallbackAction } from "./actions/OIDCCallbackAction.ts";
import { OIDCProvider } from "./providers/OIDCProvider.ts";

@injectable()
export class AuthRouter {
  constructor(
    @inject(proxy) private app: express.Express,
    private OIDCProvider: OIDCProvider,
    private OIDCCallbackAction: OIDCCallbackAction,
    private config: ConfigInterfaceResolver,
  ) {}

  register() {
    // inject a global middleware to check on Authorization header
    this.app.use(asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      if (req.headers?.authorization) {
        const token = (req.headers?.authorization || "").toString().replace("Bearer ", "");
        const data = await this.OIDCProvider.verifyToken(token);

        req.session = req.session || {};
        req.session.user = {
          operator_id: data.operator_id,
          role: data.role,
          email: data.token_id,
        };
      }

      next();
    }));

    this.app.get("/auth/login", (req: Request, res: Response, _next: NextFunction) => {
      return res.redirect(this.OIDCProvider.getLoginUrl());
    });

    this.app.get(
      "/auth/callback",
      asyncHandler(async (req: Request, res: Response) => {
        const { code } = req.query;
        if (typeof code === "string") {
          const user = await this.OIDCCallbackAction.handle({ code });
          req.session.user = user;
        }
        return res.redirect(this.config.get("oidc.app_url"));
      }),
    );

    this.app.get("/auth/me", (req: express.Request, res: express.Response) => {
      if (req.session?.user) {
        return res.json(req.session.user);
      }

      return res.status(401).json({ error: "Utilisateur non authentifié" });
    });
  }
}
