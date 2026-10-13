import { CallType, ContextType } from "@/ilos/common/index.ts";
import { logger } from "@/lib/logger/index.ts";

// L'acquisition est exclue : déjà historisée dans carpool_v2.requests, et à fort volume.
const EXCLUDED_SERVICES = new Set(["acquisition"]);
const WRITE_METHOD =
  /^(create|update|delete|patch|cancel|apply|finalize|sync|fetch|save|claim|complete|fail|accessToken)/;
// Le worker d'export interroge en boucle : une réclamation vide n'est pas une action.
const POLLING_SIGNATURE = "exports:claim";

// Liste blanche : seuls ces identifiants sortent des params. Jamais d'identity_key, téléphone, e-mail…
const TARGET_KEYS = ["_id", "uuid", "operator_id", "territory_id", "policy_id", "campaign_id", "user_id"];
const MAX_VALUE_LENGTH = 64;

type Outcome = { ok: true; result: unknown } | { ok: false; error: unknown };

type AuditEntry = {
  context?: ContextType | null;
  params: unknown;
  ms: number;
  outcome: Outcome;
};

type Scalar = string | number;

export function isAudited(signature: string): boolean {
  const [service, method] = signature.split(":");
  return !!method && !EXCLUDED_SERVICES.has(service) && WRITE_METHOD.test(method);
}

function scalar(value: unknown): Scalar | undefined {
  return typeof value === "string" || typeof value === "number" ? value : undefined;
}

function field(obj: unknown, key: string): Scalar | undefined {
  return obj && typeof obj === "object" && !Array.isArray(obj)
    ? scalar((obj as Record<string, unknown>)[key])
    : undefined;
}

// Jamais e.message : il peut contenir des données personnelles.
function errorCode(e: unknown): string {
  if (!(e instanceof Error)) return "unknown";
  const code = (e as Error & { rpcError?: { code?: unknown } }).rpcError?.code;
  return code === undefined ? e.constructor.name : `${e.constructor.name}:${code}`;
}

export function formatAuditLine(signature: string, { context, params, ms, outcome }: AuditEntry): string {
  const user = context?.call?.user;
  const fields: Array<[string, Scalar | undefined]> = [
    ["outcome", outcome.ok ? "ok" : "error"],
    ["error", outcome.ok ? undefined : errorCode(outcome.error)],
    ["ms", Math.round(ms)],
    ["transport", scalar(context?.channel?.transport) ?? "internal"],
    ["service", scalar(context?.channel?.service)],
    ["actor_id", field(user, "_id")],
    ["actor_role", field(user, "role")],
    ["actor_operator_id", field(user, "operator_id")],
    ["actor_territory_id", field(user, "territory_id")],
    ...TARGET_KEYS.map((key): [string, Scalar | undefined] => [key, field(params, key)]),
    ["result_id", outcome.ok ? field(outcome.result, "_id") ?? field(outcome.result, "uuid") : undefined],
  ];
  const pairs = fields
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}=${sanitize(v as Scalar)}`);
  return ["[audit]", sanitize(signature), ...pairs].join(" ");
}

function sanitize(value: Scalar): string {
  return String(value).replace(/[^A-Za-z0-9_.*:-]/g, "_").substring(0, MAX_VALUE_LENGTH);
}

// L'audit ne doit jamais faire échouer l'action ni masquer son erreur.
function safeLog(level: "info" | "warn", line: () => string): void {
  try {
    logger[level](line());
  } catch {
    // ignore
  }
}

export async function audited<R>(signature: string, call: CallType, run: () => Promise<R>): Promise<R> {
  if (!isAudited(signature)) return run();

  const start = performance.now();
  const entry = (outcome: Outcome) => ({
    context: call.context,
    params: call.params,
    ms: performance.now() - start,
    outcome,
  });
  let result: R;
  try {
    result = await run();
  } catch (error) {
    safeLog("warn", () => formatAuditLine(signature, entry({ ok: false, error })));
    throw error;
  }
  if (!(signature === POLLING_SIGNATURE && result == null)) {
    safeLog("info", () => formatAuditLine(signature, entry({ ok: true, result })));
  }
  return result;
}
