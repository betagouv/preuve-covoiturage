import { rateLimiter } from '../middlewares/rateLimiter';
import { asyncHandler } from '../helpers/asyncHandler';
import { createRPCPayload } from '../helpers/createRPCPayload';
import { RPCResponseType } from '../shared/common/rpc/RPCResponseType';
import { Express } from 'express';
import { KernelInterface } from '@ilos/common';

export function monthlyFluxRoute(app:Express, kernel:KernelInterface){
  app.get(
    '/observatory',
    rateLimiter(),
    asyncHandler(async (req, res, next) => {
      const response = await kernel.handle(
        createRPCPayload('observatory:monthlyFlux', req.query, { permissions: ['common.observatory.stats'] }),
      );
      this.send(res, response as RPCResponseType);
    }),
  );
};