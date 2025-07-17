import { KernelInterface } from "@/ilos/common/index.ts";
import { NextFunction, Request as ExpressRequest, Response as ExpressResponse } from "dep:express";
import { accessTokenMiddleware } from "./accessTokenMiddleware.ts";

export function authGuard(kernel: KernelInterface) {
  return async (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    if (req.headers.authorization) {
      return accessTokenMiddleware(kernel)(req, res, next);
    }
    next();
  };
}
