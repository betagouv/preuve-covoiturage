import { _, process, Request as ExpressRequest, Response } from "@/deps.ts";
import {
  ForbiddenException,
  KernelInterface,
  UnauthorizedException,
} from "@/ilos/common/index.ts";
import { TokenProviderInterfaceResolver } from "@/pdc/providers/token/index.ts";

import { ApplicationInterface } from "@/shared/application/common/interfaces/ApplicationInterface.ts";
import { TokenPayloadInterface } from "@/shared/application/common/interfaces/TokenPayloadInterface.ts";
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

  const app_uuid = _.get(app, "result.uuid", "");
  const owner_id = _.get(app, "result.owner_id", null);
  const matchUuid = app_uuid === payload.a;

  // V1 tokens have a string owner_id. Check is done on UUID only
  const matchOwn = typeof payload.o === "string"
    ? true
    : owner_id === payload.o;
  if (!matchUuid || !matchOwn) {
    throw new UnauthorizedException("Unauthorized application");
  }

  return (app as any).result as ApplicationInterface;
}

async function logRequest(
  kernel: KernelInterface,
  request: Request,
  payload: TokenPayloadInterface,
): Promise<void> {
  if (_.get(process.env, "NODE_ENV", "") === "production") return;
  if (
    _.get(process.env, "APP_DEBUG_REQUEST", "false").trim().toLowerCase() !==
      "true"
  ) {
    return;
  }

  await kernel.handle(
    createRPCPayload(
      "acquisition:logrequest",
      {
        operator_id: parseInt(payload.o as any, 10) || 0,
        source: "serverTokenMiddleware",
        error_message: null,
        error_code: null,
        error_line: null,
        auth: {},
        headers: request.headers || {},
        body: request.body,
      },
      { permissions: ["acquisition.logrequest"] },
    ),
  );

  console.debug(
    `logRequest [${_.get(request, "headers.x-request-id", "")}] ${
      _.get(request, "body.journey_id", "")
    }`,
  );
}

export function serverTokenMiddleware(
  kernel: KernelInterface,
  tokenProvider: TokenProviderInterfaceResolver,
) {
  return async (req: Request, res: Response, next: Function): Promise<void> => {
    try {
      const token = _.get(req, "headers.authorization", null);
      if (!token) {
        return next();
      }

      const payload = await tokenProvider.verify<
        TokenPayloadInterface & {
          app: string;
          id: number;
          permissions: string[];
        }
      >(token.toString().replace("Bearer ", ""), {
        ignoreExpiration: true,
      });

      try {
        await logRequest(kernel, req, payload);
      } catch (e) {
        console.error(`logRequest ERROR ${e.message}`);
      }

      /**
       * Handle V1 token format conversion
       */
      if ("id" in payload && "app" in payload) {
        payload.v = 1;
        payload.a = payload.app;
        payload.o = payload.id;
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
      _.set(req, "session.user", {
        application_id: app._id,
        operator_id: app.owner_id,
        permissions: app.permissions,
      });

      next();
    } catch (e) {
      console.error(`[acquisition:create] ${e.message}`, e);
      next(e);
    }
  };
}
