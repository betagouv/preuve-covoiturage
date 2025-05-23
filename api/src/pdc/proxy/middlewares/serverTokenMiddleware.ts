import { ForbiddenException, KernelInterface, UnauthorizedException } from "@/ilos/common/index.ts";
import { TokenProviderInterfaceResolver } from "@/pdc/providers/token/index.ts";
import { Request as ExpressRequest, Response } from "dep:express";

import { logger } from "@/lib/logger/index.ts";
import { get, set } from "@/lib/object/index.ts";
import { ApplicationInterface } from "../../services/application/contracts/common/interfaces/ApplicationInterface.ts";
import { TokenPayloadInterface } from "../../services/application/contracts/common/interfaces/TokenPayloadInterface.ts";
import { createRPCPayload } from "../helpers/createRPCPayload.ts";

interface Request extends ExpressRequest {
  operator: string;
  permissions: string[];
}

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

export function serverTokenMiddleware(
  kernel: KernelInterface,
  tokenProvider: TokenProviderInterfaceResolver,
) {
  return async (req: Request, _res: Response, next: Function): Promise<void> => {
    try {
      const token = get(req, "headers.authorization", null);
      if (!token) {
        return next();
      }

      const payload = await tokenProvider.verify<
        & TokenPayloadInterface
        & Partial<{
          app: string;
          id: number;
          permissions: string[];
        }>
      >(String(token).replace("Bearer ", ""), {
        ignoreExpiration: true,
      });

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
      logger.error(`[acquisition:create] ${(e as Error).message}`, e);
      next(e);
    }
  };
}
