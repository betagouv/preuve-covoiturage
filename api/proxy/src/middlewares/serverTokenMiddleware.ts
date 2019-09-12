import express from 'express';
import { get } from 'lodash';

import { TokenProvider } from '@pdc/provider-token';
import { KernelInterface, UnauthorizedException, ForbiddenException, RPCResponseType } from '@ilos/common';
import { TokenPayloadInterface } from '@pdc/provider-token/dist/interfaces';

interface Request extends express.Request {
  operator: string;
  permissions: string[];
}

/**
 * Make sure the application exists, belongs the right operator
 * and is not soft deleted
 *
 * TODO use Redis for a faster lookup
 */
async function checkApplication(kernel: KernelInterface, payload: TokenPayloadInterface): Promise<Boolean> {
  const app: RPCResponseType = await kernel.handle({
    id: 1,
    jsonrpc: '2.0',
    method: 'application:find',
    params: {
      params: { _id: payload.appId, operator_id: payload.operatorId, deleted_at: null },
      _context: { call: { user: { permissions: ['application.find'] } } },
    },
  });

  const appId = get(app, 'result._id', '').toString();
  const opId = get(app, 'result.operator_id', null);

  return appId === payload.appId && opId === payload.operatorId;
}

export function serverTokenMiddleware(kernel: KernelInterface, tokenProvider: TokenProvider) {
  return async (req: Request, res: express.Response, next: Function): Promise<void> => {
    try {
      const token = get(req, 'headers.authorization', null);
      if (!token) {
        return next();
      }

      const payload = await tokenProvider.verify(token.toString().replace('Bearer ', ''));

      if (!payload.appId || !payload.operatorId) {
        throw new ForbiddenException();
      }

      // TODO add application:find call
      await checkApplication(kernel, payload);

      // The only permissions now. Store in the token or retrieve
      // from the application service later if it gets more complex.
      if (!payload.permissions) {
        payload.permissions = ['journey.create'];
      }

      // inject the operatorId and permissions in the request
      // @ts-ignore
      req.session = req.session || {};
      req.session.user = req.user || {};
      req.session.user.application_id = payload.appId;
      req.session.user.operator_id = payload.operatorId;
      req.session.user.permissions = payload.permissions;

      next();
    } catch (e) {
      next(new UnauthorizedException(`TokenMiddleware: ${e.message}`));
    }
  };
}
