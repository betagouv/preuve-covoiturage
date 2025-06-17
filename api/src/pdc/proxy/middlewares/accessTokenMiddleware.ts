import { ForbiddenException, KernelInterface, UnauthorizedException } from "@/ilos/common/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { get, set } from "@/lib/object/index.ts";
import { TokenProviderInterfaceResolver } from "@/pdc/providers/token/index.ts";
import { DexOIDCProvider } from "@/pdc/services/auth/providers/DexOIDCProvider.ts";
import { NextFunction, Request as ExpressRequest, Response } from "dep:express";
import { ApplicationInterface } from "../../services/application/contracts/common/interfaces/ApplicationInterface.ts";
import { TokenPayloadInterface } from "../../services/application/contracts/common/interfaces/TokenPayloadInterface.ts";
import { getPermissions } from "../../services/auth/config/permissions.ts";
import { UserRepository } from "../../services/auth/providers/UserRepository.ts";
import { createRPCPayload } from "../helpers/createRPCPayload.ts";

/**
 * Make sure the application exists, belongs the right operator
 * and is not soft deleted
 *
 * TODO use Redis for a faster lookup
 */
async function checkApplication(
  kernel: KernelInterface,
  payload: TokenPayloadInterface,
): Promise<ApplicationInterface> {
  const app = await kernel.handle(
    createRPCPayload(
      "application:find",
      { uuid: payload.a, owner_id: payload.o, owner_service: payload.s },
      { permissions: ["proxy.application.find"] },
    ),
  );

  const app_uuid = get(app, "result.uuid", "") as string;
  const owner_id = get(app, "result.owner_id", null) as number | null;
  const matchUuid = app_uuid === payload.a;

  // V1 tokens have a string owner_id. Check is done on UUID only
  const matchOwn = typeof payload.o === "string" ? true : owner_id === payload.o;
  if (!matchUuid || !matchOwn) {
    throw new UnauthorizedException("Unauthorized application");
  }

  return (app as any).result as ApplicationInterface;
}

function getTokenFromRequest(req: ExpressRequest): string {
  const authHeader = get(req, "headers.authorization", "");
  if (!authHeader) {
    throw new UnauthorizedException("No token provided");
  }
  const token = String(authHeader).replace("Bearer ", "");
  if (!token.length) {
    throw new UnauthorizedException("Empty token provided");
  }
  return token;
}

/**
 * Returns an Express middleware that checks the token using DexOIDCProvider.
 * Accepts either a KernelInterface or a DexOIDCProvider instance as argument.
 */
export function dexMiddleware(kernel: KernelInterface) {
  return async (req: ExpressRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = getTokenFromRequest(req);
      const dexProvider = kernel.get(DexOIDCProvider);

      const data = await dexProvider.verifyToken(token);
      req.session = req.session || {};

      const repo = kernel.get(UserRepository);
      const user = await repo.findUserByEmail(data.token_id);
      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      req.session.user = {
        operator_id: data.operator_id,
        role: data.role,
        email: data.token_id,
        permissions: getPermissions(data.role),
      };

      next();
    } catch (e) {
      // skip the unsupported algorithm message falling back to legacy token middleware
      // to avoid bloating the logs.
      if (Error.isError(e) && !e.message.includes("value for a JSON Web Key Set")) {
        logger.warn(`[dexMiddleware] ${e.message}`);
      }

      next(e);
    }
  };
}

/**
 * Check the token using DexOIDCProvider and
 * fallback to legacy serverTokenMiddleware if it fails.
 */
export function accessTokenMiddleware(kernel: KernelInterface) {
  return async (req: ExpressRequest, _res: Response, next: NextFunction): Promise<void> => {
    dexMiddleware(kernel)(req, _res, async (err: Error | null) => {
      if (err) {
        // If dexMiddleware fails, fallback to serverTokenMiddleware
        await legacyTokenMiddleware(kernel)(req, _res, next);
      } else {
        next();
      }
    });
  };
}

/**
 * @deprecated application token to remove when all clients are migrated to DexOIDCProvider
 */
export function legacyTokenMiddleware(kernel: KernelInterface) {
  return async (req: ExpressRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get the token from the request headers
      const token = getTokenFromRequest(req);
      const tokenProvider = kernel.get(TokenProviderInterfaceResolver);
      const payload = await tokenProvider.verify<
        & TokenPayloadInterface
        & Partial<{
          app: string;
          id: number;
          permissions: string[];
        }>
      >(token, { ignoreExpiration: true });

      /**
       * Handle V1 token format conversion
       */
      if ("id" in payload && "app" in payload) {
        payload.v = 1;
        payload.a = payload.app as string;
        payload.o = payload.id as number;
        payload.s = "operator";
        delete payload.id;
        delete payload.app;
        delete payload.permissions;
      }

      if (!payload.a || !payload.o) {
        throw new ForbiddenException();
      }

      // Check and get the app
      const app = await checkApplication(kernel, payload);

      // inject the operator ID and permissions in the request
      set(req, "session.user", {
        application_id: app._id,
        operator_id: app.owner_id,
        permissions: app.permissions,
      });

      next();
    } catch (e) {
      logger.warn(`[legacyTokenMiddleware] ${(e as Error).message}`);
      return next(e);
    }
  };
}
