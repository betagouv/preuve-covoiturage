import { errorCode, taggedLogger } from "@/lib/logger/tagged.ts";

const log = taggedLogger("[http]");

type RouteError = { httpCode?: number; rpcError?: { data?: unknown }; message?: string; stack?: string };

// Ne relaie du détail d'une erreur 4xx que des messages de violation.
export function violationMessages(data: unknown): string | string[] | undefined {
  if (typeof data === "string") return data;
  if (Array.isArray(data) && data.length > 0 && data.every((v) => typeof v === "string")) return data as string[];
  return undefined;
}

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

  const violations = violationMessages(err.rpcError?.data);

  if (rpcAnswerOnFailure) {
    const rpcError = err.rpcError ? { ...err.rpcError, data: violations } : { message: err.message };
    return { status, body: { jsonrpc: "2.0", id: 1, error: rpcError } };
  }
  return { status, body: violations ?? { error: err.message ?? "An unexpected error occurred." } };
}
