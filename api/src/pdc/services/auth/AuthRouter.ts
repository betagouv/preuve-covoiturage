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

    this.app.get("/auth/me", (req: express.Request, res: express.Response) => {
      console.log(req);
      if (req.session.user) {
        return res.json(req.session.user);
      }
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    });

    // TODO PROXY
    // "/auth/token" -> oidcProvider/getToken(access_key, secret_key)
    // TODO : Add middleware to check the JWT -> ok : operator_id + role à mettre dans le context de l'appel du Kernel
    // Spec POST /auth/token (perdu dans les PR fermées sans être mergées)
    // https://github.com/betagouv/preuve-covoiturage/pull/2529

    // ajouter un middleware global pour check
    // si un token est envoyé en bearer et dans se cas
    // on utilise le verifyToken pour remplir req.session
  }
}
