import { ConfigInterfaceResolver, inject, injectable, proxy } from "@/ilos/common/index.ts";
import { asyncHandler } from "@/pdc/proxy/helpers/asyncHandler.ts";
import { ProConnectOIDCProvider } from "@/pdc/services/auth/providers/ProConnectOIDCProvider.ts";
import express, { NextFunction, Request, Response } from "dep:express";
import { DexOIDCProvider } from "./providers/DexOIDCProvider.ts";

@injectable()
export class AuthRouter {
  constructor(
    @inject(proxy) private app: express.Express,
    private dexOIDCProvider: DexOIDCProvider,
    private proConnectOIDCProvider: ProConnectOIDCProvider,
    private config: ConfigInterfaceResolver,
  ) {}

  register() {
    // inject a global middleware to check on Authorization header
    this.app.use(asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      if (req.headers?.authorization) {
        const token = (req.headers?.authorization || "").toString().replace("Bearer ", "");
        const data = await this.dexOIDCProvider.verifyToken(token);
        req.session = req.session || {};
        req.session.user = {
          operator_id: data.operator_id,
          role: data.role,
          email: data.token_id,
        };
      }

      next();
    }));

    this.app.get(
      "/auth/login",
      asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
        const { redirectUrl, state, nonce } = await this.proConnectOIDCProvider.getLoginUrl();
        req.session = req.session || {};
        req.session.auth = {
          state,
          nonce,
        };

        return res.redirect(redirectUrl);
      }),
    );

    this.app.get(
      "/callback",
      //"/auth/login/callback",
      asyncHandler(async (req: Request, res: Response) => {
        const url = new URL(`${req.protocol}://${req.get("host")}${req.originalUrl}`);
        const { state, nonce } = req.session?.auth;
        const tokens = await this.proConnectOIDCProvider.getToken(url, nonce, state);
        req.session = req.session || {};
        req.session.auth = {};
        req.session.auth.id_token = tokens.id_token;
        const claims = tokens.claims();
        const user = await this.proConnectOIDCProvider.getUserInfo(tokens.access_token, claims!.sub);
        req.session.user = user;
        return res.redirect(this.config.get("app_url"));
      }),
    );

    this.app.get(
      "/auth/logout",
      asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
        const { id_token } = req.session?.auth;
        const { redirectUrl, state } = await this.proConnectOIDCProvider.getLogoutUrl(id_token);
        req.session = req.session || {};
        req.session.auth = {
          state,
        };

        return res.redirect(redirectUrl);
      }),
    );

    this.app.get(
      "/auth/logout/callback",
      asyncHandler(async (req: Request, res: Response) => {
        const { state: expectedState } = req.session?.auth;
        const state = req.query?.state;
        if (state === expectedState) {
          req.session.destroy((err: Error) => {
            if (err) {
              throw err;
            }
            return res.redirect(this.config.get("app_url"));
          });
        }
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
