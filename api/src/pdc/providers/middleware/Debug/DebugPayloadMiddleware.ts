import {
  ContextType,
  middleware,
  MiddlewareInterface,
  ParamsType,
  SingleMiddlewareConfigType,
} from "@/ilos/common/index.ts";
import { NextFunction } from "dep:express";

@middleware()
export class DebugPayloadMiddleware implements MiddlewareInterface {
  async process(
    params: ParamsType,
    context: ContextType,
    next: NextFunction,
  ): Promise<void> {
    console.info("Context:", JSON.stringify(context, null, 2));
    console.info("Params:", JSON.stringify(params, null, 2));
    next(params, context);
  }
}

const alias = "debug.payload";
export const debugPayloadMiddlewareBinding: SingleMiddlewareConfigType = [
  alias,
  DebugPayloadMiddleware,
];
