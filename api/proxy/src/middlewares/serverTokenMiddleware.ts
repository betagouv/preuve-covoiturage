import express from 'express';

import { Interfaces, Exceptions } from '@ilos/core';
import { TokenProvider } from '@pdc/provider-token';

interface Request extends express.Request {
  operator: string;
  permissions: string[];
}

export function serverTokenMiddleware(kernel: Interfaces.KernelInterface, tokenProvider: TokenProvider) {
  return async (req: Request, res: express.Response, next: Function): Promise<void> => {
    try {
      if (!('authorization' in req.headers)) {
        next();
      }

      const token = req.headers.authorization.toString().replace('Bearer ', '');
      const payload = await tokenProvider.verify(token);

      // TODO add application:check call

      // The only permissions now. Store in the token or retrieve
      // from the application service later if it gets more complex.
      if (!payload.permissions) {
        payload.permissions = ['journey.create'];
      }

      // inject the operatorId and permissions in the request
      // @ts-ignore
      req.session = req.session || {};
      req.session.user = req.user || {};
      req.session.user.operator_id = payload.operatorId;
      req.session.user.permissions = payload.permissions;

      next();
    } catch (e) {
      console.log(`Token: ${e.message}`);
      next(new Exceptions.UnauthorizedException(`Token: ${e.message}`));
    }
  };
}
