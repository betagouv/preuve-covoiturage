import { errorCode, taggedLogger } from "@/lib/logger/tagged.ts";

const log = taggedLogger("[http]");

type RouteError = { httpCode?: number; rpcError?: { data?: unknown }; message?: string; stack?: string };

export function formatRouteError(e: unknown, rpcAnswerOnFailure: boolean): { status: number; body: unknown } {
  const err = (typeof e === "object" && e !== null ? e : {}) as RouteError;
  const status = err.httpCode || 500;

  if (status >= 500) {
    log.error("route failed", { status, error: errorCode(e) });
    const message = "Internal Server Error";
    return {
      status,
      body: rpcAnswerOnFailure
        ? { jsonrpc: "2.0", id: 1, error: { code: status, data: "Error", message } }
        : { error: message },
    };
  }

  if (rpcAnswerOnFailure) {
    return { status, body: { jsonrpc: "2.0", id: 1, error: err.rpcError ?? { message: err.message } } };
  }
  return { status, body: err.rpcError?.data ?? { error: err.message ?? "An unexpected error occurred." } };
}
