import { ContextType, ParamsType } from "@/ilos/common/types/index.ts";
import { Request, Response } from "dep:express";

export interface RouteParams {
  path: string;
  method: "GET" | "PUT" | "POST" | "DELETE" | "PATCH";
  rateLimiter?: {
    windowMinute: number;
    limit: number;
    key: string;
  };
  action: string;
  successHttpCode?: number;
  actionParamsFn?: (req: Request) => Promise<ParamsType>;
  actionContextFn?: (req: Request) => Promise<ContextType>;
  responseFn?: (res: Response, result: unknown) => Promise<void>;
  rpcAnswerOnSuccess?: boolean;
  rpcAnswerOnFailure?: boolean;
}
