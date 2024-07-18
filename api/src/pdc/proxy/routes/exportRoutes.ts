import { Request, Response } from "@/deps.ts";
import { RPCResponseType } from "@/ilos/common/index.ts";
import { get } from "@/lib/object/index.ts";
import {
  handlerConfigV2,
  handlerConfigV3,
} from "@/shared/export/create.contract.ts";
import { HttpTransport } from "../HttpTransport.ts";
import { asyncHandler } from "../helpers/asyncHandler.ts";
import { createRPCPayload } from "../helpers/createRPCPayload.ts";
import { rateLimiter } from "../middlewares/rateLimiter.ts";
import { serverTokenMiddleware } from "../middlewares/serverTokenMiddleware.ts";

/**
 * Export routes
 *
 * Export V2 is using the /rpc route with the following methods:
 * - trip:export
 * - trip:publishOpenData
 *
 * Export V3 is using a REST API with the following routes:
 * - POST /v3/exports
 * - POST /v3/exports/:uuid/notify ???
 * - GET /v3/exports
 * - GET /v3/exports/:uuid
 * - GET /v3/exports/:uuid/status
 * - GET /v3/exports/:uuid/attachment
 * - DELETE /v3/exports/:uuid
 */
export function register(transport: HttpTransport): void {
  const { app, tokenProvider } = transport;
  const send = transport.send.bind(transport);
  const kernel = transport.getKernel();

  /**
   * Export trips from a V2 payload to a V3 output file.
   *
   * The V2 way to handle exports is done throught the /rpc route calling
   * the trip:export method.
   *
   * @deprecated This should be removed when the dashboard is updated.
   */
  app.post(
    "/v2/exports",
    rateLimiter(),
    serverTokenMiddleware(kernel, tokenProvider),
    asyncHandler(async (req: Request, res: Response) => {
      const user = get(req, "session.user", {});
      const action = `export:${handlerConfigV2.method}`;
      const response = await kernel.handle(
        createRPCPayload(action, req.body, user, { req }),
      );
      send(res, response);
    }),
  );

  /**
   * Export trips from a V3 payload to a V3 output file
   */
  app.post(
    "/v3/exports",
    rateLimiter(),
    serverTokenMiddleware(kernel, tokenProvider),
    asyncHandler(async (req: Request, res: Response) => {
      const user = get(req, "session.user", {});
      const action = `export:${handlerConfigV3.method}`;
      const response = await kernel.handle(
        createRPCPayload(action, req.body, user, { req }),
      );
      send(res, response);
    }),
  );

  app.get(
    "/v3/exports",
    rateLimiter(),
    serverTokenMiddleware(kernel, tokenProvider),
    asyncHandler(async (req: Request, res: Response) => {
      const user = get(req, "session.user", {});
      const response = (await kernel.handle(
        createRPCPayload("export:list", req.query, user, { req }),
      )) as RPCResponseType;
      send(res, response);
    }),
  );

  app.get(
    "/v3/exports/:uuid",
    rateLimiter(),
    serverTokenMiddleware(kernel, tokenProvider),
    asyncHandler(async (req: Request, res: Response) => {
      const user = get(req, "session.user", {});
      const response = (await kernel.handle(
        createRPCPayload("export:get", { uuid: req.params.uuid }, user, {
          req,
        }),
      )) as RPCResponseType;
      send(res, response);
    }),
  );

  app.get(
    "/v3/exports/:uuid/status",
    rateLimiter(),
    serverTokenMiddleware(kernel, tokenProvider),
    asyncHandler(async (req: Request, res: Response) => {
      const user = get(req, "session.user", {});
      const response = (await kernel.handle(
        createRPCPayload("export:status", { uuid: req.params.uuid }, user, {
          req,
        }),
      )) as RPCResponseType;
      send(res, response);
    }),
  );

  app.get(
    "/v3/exports/:uuid/attachment",
    rateLimiter(),
    serverTokenMiddleware(kernel, tokenProvider),
    asyncHandler(async (req: Request, res: Response) => {
      const user = get(req, "session.user", {});
      const response = (await kernel.handle(
        createRPCPayload("export:download", { uuid: req.params.uuid }, user, {
          req,
        }),
      )) as RPCResponseType;
      send(res, response);
    }),
  );

  app.delete(
    "/v3/exports/:uuid",
    rateLimiter(),
    serverTokenMiddleware(kernel, tokenProvider),
    asyncHandler(async (req: Request, res: Response) => {
      const user = get(req, "session.user", {});
      const response = (await kernel.handle(
        createRPCPayload("export:delete", { uuid: req.params.uuid }, user, {
          req,
        }),
      )) as RPCResponseType;
      send(res, response);
    }),
  );
}
