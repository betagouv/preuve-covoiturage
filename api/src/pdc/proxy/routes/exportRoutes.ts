import { RPCResponseType } from '@shared/common/rpc/RPCResponseType';
import { get } from 'lodash';
import { HttpTransport } from '../HttpTransport';
import { asyncHandler } from '../helpers/asyncHandler';
import { createRPCPayload } from '../helpers/createRPCPayload';
import { rateLimiter } from '../middlewares/rateLimiter';
import { serverTokenMiddleware } from '../middlewares/serverTokenMiddleware';

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
  const { app, send, tokenProvider } = transport;
  const kernel = transport.getKernel();

  app.post(
    '/v3/exports',
    rateLimiter(),
    serverTokenMiddleware(kernel, tokenProvider),
    asyncHandler(async (req, res, next) => {
      const user = get(req, 'session.user', {});
      const response = await kernel.handle(createRPCPayload('export:create', req.body, user, { req }));
      send(res, response);
    }),
  );

  app.get(
    '/v3/exports',
    rateLimiter(),
    serverTokenMiddleware(kernel, tokenProvider),
    asyncHandler(async (req, res, next) => {
      const user = get(req, 'session.user', {});
      const response = (await kernel.handle(
        createRPCPayload('export:list', req.query, user, { req }),
      )) as RPCResponseType;
      send(res, response);
    }),
  );

  app.get(
    '/v3/exports/:uuid',
    rateLimiter(),
    serverTokenMiddleware(kernel, tokenProvider),
    asyncHandler(async (req, res, next) => {
      const user = get(req, 'session.user', {});
      const response = (await kernel.handle(
        createRPCPayload('export:get', { uuid: req.params.uuid }, user, { req }),
      )) as RPCResponseType;
      send(res, response);
    }),
  );

  app.get(
    '/v3/exports/:uuid/status',
    rateLimiter(),
    serverTokenMiddleware(kernel, tokenProvider),
    asyncHandler(async (req, res, next) => {
      const user = get(req, 'session.user', {});
      const response = (await kernel.handle(
        createRPCPayload('export:status', { uuid: req.params.uuid }, user, { req }),
      )) as RPCResponseType;
      send(res, response);
    }),
  );

  app.get(
    '/v3/exports/:uuid/attachment',
    rateLimiter(),
    serverTokenMiddleware(kernel, tokenProvider),
    asyncHandler(async (req, res, next) => {
      const user = get(req, 'session.user', {});
      const response = (await kernel.handle(
        createRPCPayload('export:download', { uuid: req.params.uuid }, user, { req }),
      )) as RPCResponseType;
      send(res, response);
    }),
  );

  app.delete(
    '/v3/exports/:uuid',
    rateLimiter(),
    serverTokenMiddleware(kernel, tokenProvider),
    asyncHandler(async (req, res, next) => {
      const user = get(req, 'session.user', {});
      const response = (await kernel.handle(
        createRPCPayload('export:delete', { uuid: req.params.uuid }, user, { req }),
      )) as RPCResponseType;
      send(res, response);
    }),
  );
}
