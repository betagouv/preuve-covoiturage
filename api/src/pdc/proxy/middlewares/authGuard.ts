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

// Route non publique sans utilisateur (session ou jeton) : 401 explicite, pas d'action anonyme en 403.
export function requireUser() {
  return (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    if (req.session?.user || req.stateless?.user) return next();
    return res.status(401).json({
      id: 1,
      jsonrpc: "2.0",
      error: { code: 401, data: "Error", message: "Unauthorized Error" },
    });
  };
}
