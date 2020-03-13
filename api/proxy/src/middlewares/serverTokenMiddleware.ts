import express from 'express';
import { get } from 'lodash';
import { KernelInterface, UnauthorizedException, ForbiddenException } from '@ilos/common';
import { TokenProviderInterfaceResolver } from '@pdc/provider-token';

import { ApplicationInterface } from '../shared/application/common/interfaces/ApplicationInterface';
import { TokenPayloadInterface } from '../shared/application/common/interfaces/TokenPayloadInterface';

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
async function checkApplication(
  kernel: KernelInterface,
  payload: TokenPayloadInterface,
): Promise<ApplicationInterface> {
  const app = await kernel.handle({
    id: 1,
    jsonrpc: '2.0',
    method: 'application:find',
    params: {
      params: { uuid: payload.a, owner_id: payload.o, owner_service: payload.s },
      _context: { call: { user: { permissions: ['application.find'] } } },
    },
  });

  const app_uuid = get(app, 'result.uuid', '');
  // disabled until owner_id is migrated as integer
  // const owner_id = get(app, 'result.owner_id', null);
  // return app_uuid === payload.a && owner_id === payload.o;
  if (app_uuid !== payload.a) {
    throw new UnauthorizedException('Unauthorized application');
  }

  return (app as any).result as ApplicationInterface;
}

async function logRequest(kernel: KernelInterface, request: Request, payload: TokenPayloadInterface): Promise<void> {
  if (get(process.env, 'NODE_ENV', '') === 'production') return;
  if (
    get(process.env, 'APP_DEBUG_REQUEST', 'false')
      .trim()
      .toLowerCase() !== 'true'
  ) {
    return;
  }

  await kernel.call(
    'acquisition:logrequest',
    {
      operator_id: parseInt(payload.o as any, 0) || 0,
      source: 'serverTokenMiddleware',
      error_message: null,
      error_code: null,
      error_line: null,
      auth: {},
      headers: request.headers || {},
      body: request.body,
    },
    { channel: { service: 'proxy' }, call: { user: { permissions: ['acquisition.logrequest'] } } },
  );
  console.log(`logRequest [${get(request, 'headers.x-request-id', '')}] ${get(request, 'body.journey_id')}`);
}

export function serverTokenMiddleware(kernel: KernelInterface, tokenProvider: TokenProviderInterfaceResolver) {
  return async (req: Request, res: express.Response, next: Function): Promise<void> => {
    try {
      const token = get(req, 'headers.authorization', null);
      if (!token) {
        return next();
      }

      const payload = await (tokenProvider.verify<TokenPayloadInterface>(token.toString().replace('Bearer ', ''), {
        ignoreExpiration: true,
      }) as Promise<any>);

      try {
        await logRequest(kernel, req, payload);
      } catch (e) {
        console.log('logRequest ERROR', { e });
      }

      /**
       * Handle V1 token format conversion
       */
      if ('id' in payload && 'app' in payload) {
        payload.v = 1;
        payload.a = payload.app;
        payload.o = payload.id;
        payload.s = 'operator';
        delete payload.id;
        delete payload.app;
        delete payload.permissions;
      }

      if (!payload.a || !payload.o) {
        throw new ForbiddenException();
      }

      // Check and get the app
      const app = await checkApplication(kernel, payload);

      // The only permissions now. Store in the token or retrieve
      // from the application service later if it gets more complex.
      if (!payload.p) {
        payload.p = ['journey.create'];
      }

      // inject the operator ID and permissions in the request
      // @ts-ignore
      req.session = req.session || {};
      req.session.user = req.session.user || {};
      req.session.user.application_id = app._id;
      req.session.user.operator_id = app.owner_id;
      req.session.user.permissions = app.permissions;

      next();
    } catch (e) {
      console.log('[acquisition:create]', e.message);
      next(new UnauthorizedException(`TokenMiddleware: ${e.message}`));
    }
  };
}
