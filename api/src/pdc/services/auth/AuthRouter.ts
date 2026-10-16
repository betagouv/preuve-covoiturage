import { ConfigInterfaceResolver, inject, injectable, KernelInterfaceResolver, proxy } from "@/ilos/common/index.ts";
import { env_or_default } from "@/lib/env/index.ts";
import { asyncHandler } from "@/pdc/proxy/helpers/asyncHandler.ts";
import { sessionRef } from "@/pdc/proxy/helpers/sessionRef.ts";
import { MfaRequiredError, ProConnectOIDCProvider } from "@/pdc/services/auth/providers/ProConnectOIDCProvider.ts";
import { LoginErrorCode, loginErrorCode } from "@/pdc/services/auth/loginError.ts";
import { errorCode, newAttemptId, proconnectLog } from "@/pdc/services/auth/providers/proconnectLog.ts";
import { UserRepository } from "@/pdc/services/auth/providers/UserRepository.ts";
import { UserScopeRepository } from "@/pdc/services/auth/providers/UserScopeRepository.ts";
import express, { NextFunction, Request, Response } from "dep:express";
import { session } from "../../../config/proxy.ts";
import { authGuard } from "../../proxy/middlewares/authGuard.ts";
import { authRateLimiter, loginRateLimiter } from "../../proxy/middlewares/rateLimiter.ts";
import { sessionMiddleware } from "../../proxy/middlewares/sessionMiddleware.ts";
import { contextRoute } from "./context.ts";
import { testCallbackRoute } from "./test/callback.ts";
import { isTestAuthEnabled } from "./test/enabled.ts";

const elapsed = (start: number) => Math.round(performance.now() - start);

@injectable()
export class AuthRouter {
  constructor(
    @inject(proxy) private app: express.Express,
    private kernel: KernelInterfaceResolver,
    private proConnectOIDCProvider: ProConnectOIDCProvider,
    private config: ConfigInterfaceResolver,
    private userScopeRepository: UserScopeRepository,
    private userRepository: UserRepository,
  ) {
  }

  register() {
    this.app.get(
      "/auth/login",
      authRateLimiter(),
      asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
        const { redirectUrl, state, nonce } = await this.proConnectOIDCProvider.getLoginUrl();
        req.session = req.session || {};
        const attempt = newAttemptId();
        req.session.auth = { state, nonce, attempt };
        proconnectLog.info("login start", { attempt, mfa_required: this.config.get("proconnect.require_mfa") });

        return res.redirect(redirectUrl);
      }),
    );

    this.app.get(
      "/auth/login/callback",
      authRateLimiter(),
      asyncHandler(async (req: Request, res: Response) => {
        const url = new URL(req.originalUrl, this.config.get("proxy.apiUrl"));
        const { state, nonce, attempt = "none" } = req.session?.auth || {};
        const provider_error = url.searchParams.get("error") ?? undefined;
        const session_state = state && nonce ? "ok" : "missing";
        // distingue cookie non renvoyé par le navigateur et session introuvable côté serveur
        const cookie = req.headers.cookie?.includes(`${session.name}=`) ? "present" : "absent";
        // cookie de session perdu ou refus côté ProConnect : cas d'échec typiques
        const received = session_state === "missing" || provider_error ? "warn" : "info";
        proconnectLog[received]("callback received", { attempt, session_state, cookie, provider_error });

        // Tout échec revient au front avec un code générique ; pas d'identité attachée, mais on jette
        // l'état OIDC de la tentative échouée.
        const refuse = async (code: LoginErrorCode) => {
          await new Promise<void>((resolve) => req.session ? req.session.destroy(() => resolve()) : resolve());
          res.clearCookie(session.name);
          return res.redirect(`${this.config.get("app_url")}?error=${code}`);
        };

        // Fetch tokens and user info from ProConnect OIDC Provider
        // (état OIDC state/nonce lu ci-dessus, avant la régénération de session)
        let tokens;
        let start = performance.now();
        try {
          tokens = await this.proConnectOIDCProvider.getToken(url, nonce, state);
        } catch (e) {
          const code = loginErrorCode(e);
          if (code === "mfa_required") {
            proconnectLog.warn("mfa refused", { attempt, acr: (e as MfaRequiredError).acr, error: errorCode(e) });
          } else {
            // state/nonce invalide, session perdue, `error=` ProConnect ou échange de code refusé
            proconnectLog.warn("token failed", { attempt, provider_error, error: errorCode(e), ms: elapsed(start) });
          }
          return refuse(code);
        }

        const claims = tokens.claims();
        const str = (v: unknown) => typeof v === "string" ? v : undefined;
        const sub = str(claims?.sub);
        const idp_id = str(claims?.idp_id);
        proconnectLog.info("token ok", { attempt, acr: str(claims?.acr), sub, idp_id, ms: elapsed(start) });

        start = performance.now();
        let info;
        try {
          info = await this.proConnectOIDCProvider.getUserInfo(tokens.access_token, claims!.sub);
        } catch (e) {
          proconnectLog.warn("userinfo failed", { attempt, sub, error: errorCode(e), ms: elapsed(start) });
          return refuse("login_failed");
        }
        const { user, has_email, has_siret } = info;
        const idp = info.idp_id ?? idp_id;
        proconnectLog.info("userinfo ok", { attempt, ms: elapsed(start), has_email, has_siret });

        // Un compte absent du registre ou dont le SIREN ne correspond pas est refusé, pas ouvert en
        // session dégradée : sans cela le front voit un utilisateur connecté et tout futur écran sans garde en hérite.
        if (!user) {
          proconnectLog.warn("user refused", {
            attempt,
            reason: info.reason,
            error: info.error,
            email: info.email,
            siren: info.siren,
            sub,
            idp_id: idp,
          });
          return refuse("unauthorized");
        }

        // Anti-fixation : régénère la session avant d'attacher l'utilisateur authentifié.
        await new Promise<void>((resolve, reject) =>
          req.session.regenerate((err: Error) => err ? reject(err) : resolve())
        );

        // Store user and token information in the fresh session
        req.session.auth = { id_token: tokens.id_token };
        req.session.user = user;
        await new Promise<void>((resolve, reject) => req.session.save((err: Error) => err ? reject(err) : resolve()));
        proconnectLog.info("session created", {
          attempt,
          session: await sessionRef(req.sessionID),
          user_id: user._id,
          role: user.role,
          sub,
          idp_id: idp,
        });

        return res.redirect(this.config.get("app_url"));
      }),
    );

    this.app.get(
      "/auth/logout",
      authGuard(this.kernel),
      asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
        proconnectLog.info("logout start", {
          session: await sessionRef(req.sessionID),
          user_id: req.session?.user?._id,
        });
        const { id_token } = req.session?.auth || {};
        const { redirectUrl } = await this.proConnectOIDCProvider.getLogoutUrl(id_token);
        req.session.destroy((err: Error) => {
          if (err) {
            proconnectLog.error("logout session destroy failed", { error: errorCode(err) });
          }
          res.clearCookie(session.name);
          res.redirect(redirectUrl);
        });
      }),
    );

    this.app.get(
      "/auth/logout/callback",
      asyncHandler(async (req: Request, res: Response) => {
        proconnectLog.info("logout callback");
        // Session is already destroyed by /auth/logout; state cannot be checked here
        req.session.destroy((err: Error) => {
          if (err) {
            proconnectLog.error("logout callback session destroy failed", { error: errorCode(err) });
          }
          res.clearCookie(session.name);
          res.redirect(this.config.get("app_url"));
        });
      }),
    );

    this.app.get(
      "/auth/me",
      sessionMiddleware(this.kernel),
      (req: express.Request, res: express.Response) => {
        if (!req.session?.user) {
          return res.status(401).json({
            id: 1,
            jsonrpc: "2.0",
            error: {
              code: 401,
              data: "Error",
              message: "Unauthorized Error",
            },
          });
        }

        return res.json(req.session?.user);
      },
    );

    // Bascule du contexte actif (users territoire) — revalidée en DB, cf. spec §6.
    this.app.post("/auth/context", authRateLimiter(), contextRoute(this.userScopeRepository));

    // Test-only login, opt-in via APP_ENABLE_TEST_AUTH and never in demo/production
    const envs = [this.config.get("env"), env_or_default("APP_ENV", "local")];
    if (isTestAuthEnabled(envs, this.config.get("test.enabled"))) {
      this.config.get("test.accounts")(); // fail fast at boot if APIE2E_AUTH_* are missing
      proconnectLog.warn("test login enabled");
      this.app.post("/auth/test/callback", loginRateLimiter(), testCallbackRoute(this.config, this.userRepository));
    }
  }
}
