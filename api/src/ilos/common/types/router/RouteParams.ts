import { ContextType, ParamsType } from "@/ilos/common/types/index.ts";
import { Request, Response } from "dep:express";

export interface RouteParams {
  /**
   * HTTP path for the route.
   * It should start with a slash (/) and can contain parameters like :id.
   * The API version is automatically added as a prefix.
   *
   * @example
   * "/users/:id" or "/products"
   */
  path: string;
  method: "GET" | "PUT" | "POST" | "DELETE" | "PATCH";
  rateLimiter?: {
    windowMinute: number;
    limit: number;
    key: string;
  };

  action?: string;

  /**
   * If true, the route is public and does not require authentication.
   *
   * If false, the route requires authentication (server token or cookie).
   *
   * Defaults to false which applies the accessTokenMiddleware.
   */
  public?: boolean;

  /**
   * The HTTP status code to return on success.
   * Defaults to 200.
   *
   * @example
  successHttpCode: 201 // Created
  successHttpCode: 204 // No Content
   */
  successHttpCode?: number;

  /**
   * Process the request parameters before passing them to the action.
   */
  actionParamsFn?: (req: Request) => Promise<ParamsType>;

  /**
   * Process the request context before passing it to the action.
   * This is useful for setting up the context with user information, etc.
   */
  actionContextFn?: (req: Request) => Promise<ContextType>;

  /**
   * Process the response before sending it.
   */
  responseFn?: (res: Response, result: unknown) => Promise<void>;

  /**
   * Wrap the response in an RPC payload.
   *
   * ```json
   * {
   *  id: "1",
   *  jsonrpc: "2.0",
   *  result: {
   *    // wrapped result
   *  }
   * }
   * ```
   */
  rpcAnswerOnSuccess?: boolean;

  /**
   * Wrap the error in an RPC payload.
   *
   * ```json
   * {
   *  id: "1",
   *  jsonrpc: "2.0",
   *  error: {
   *    // wrapped error
   *  }
   * }
   * ```
   */
  rpcAnswerOnFailure?: boolean;
}
