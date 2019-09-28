import express from 'express';
import { get } from 'lodash';

import { KernelInterface, UnauthorizedException, ForbiddenException, RPCResponseType } from '@ilos/common';
import { TokenPayloadInterface, TokenProvider } from '@pdc/provider-token';

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
      params: { _id: payload.a, operator_id: payload.o, deleted_at: null },
      _context: { call: { user: { permissions: ['application.find'] } } },
    },
  });

  const application_id = get(app, 'result._id', '').toString();
  const operator_id = get(app, 'result.operator_id', null);

  return application_id === payload.a && operator_id === payload.o;
}

export function serverTokenMiddleware(kernel: KernelInterface, tokenProvider: TokenProvider) {
  return async (req: Request, res: express.Response, next: Function): Promise<void> => {
    try {
      const token = get(req, 'headers.authorization', null);
      if (!token) {
        return next();
      }

      const payload = await (<Promise<any>>tokenProvider.verify(token.toString().replace('Bearer ', '')));

      /**
       * Handle V1 token format conversion
       */
      if ('id' in payload && 'app' in payload) {
        payload.v = 1;
        payload.a = payload.app;
        payload.o = payload.id;
        delete payload.id;
        delete payload.app;
        delete payload.permissions;
      }

      if (!payload.a || !payload.o) {
        throw new ForbiddenException();
      }

      // TODO add application:find call
      await checkApplication(kernel, payload);

      // The only permissions now. Store in the token or retrieve
      // from the application service later if it gets more complex.
      if (!payload.p) {
        payload.p = ['journey.create'];
      }

      // inject the operator ID and permissions in the request
      // @ts-ignore
      req.session = req.session || {};
      req.session.user = req.session.user || {};
      req.session.user.application_id = payload.a;
      req.session.user.operator = payload.o;
      req.session.user.permissions = payload.p;

      next();
    } catch (e) {
      next(new UnauthorizedException(`TokenMiddleware: ${e.message}`));
    }
  };
}
