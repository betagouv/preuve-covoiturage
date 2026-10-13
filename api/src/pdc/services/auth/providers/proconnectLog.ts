import { logger } from "@/lib/logger/index.ts";

// Brand : seuls maskEmail/maskSiren produisent un Masked, un email/siren en clair ne compile pas.
export type Masked = string & { readonly __masked: unique symbol };

export type ProconnectFields = {
  attempt?: string;
  ms?: number;
  mfa_required?: boolean;
  session_state?: "ok" | "missing";
  cookie?: "present" | "absent";
  provider_error?: string;
  acr?: string;
  sub?: string;
  idp_id?: string;
  error?: string;
  reason?: string;
  role?: string;
  email?: Masked;
  siren?: Masked;
  has_email?: boolean;
  has_siret?: boolean;
};

const MASKED = "***" as Masked;
const MAX_VALUE_LENGTH = 64;

export function maskEmail(value?: string | null): Masked {
  const at = value?.indexOf("@") ?? -1;
  if (!value || at < 1) return MASKED;
  return `${value[0]}***${value.substring(at)}` as Masked;
}

export function maskSiren(value?: string | null): Masked {
  const siren = value?.substring(0, 9) ?? "";
  if (!/^\d{9}$/.test(siren)) return MASKED;
  return `${siren.substring(0, 3)}****${siren.substring(7)}` as Masked;
}

export function newAttemptId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function formatProconnectLine(step: string, fields: ProconnectFields = {}): string {
  const pairs = Object.entries(fields)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}=${String(v).replace(/[^A-Za-z0-9_.@*:-]/g, "_").substring(0, MAX_VALUE_LENGTH)}`);
  return ["[proconnect]", step, ...pairs].join(" ");
}

type LogMethod = (step: string, fields?: ProconnectFields) => void;

const at = (level: "debug" | "info" | "warn" | "error"): LogMethod => (step, fields) =>
  logger[level](formatProconnectLine(step, fields));

export const proconnectLog = {
  debug: at("debug"),
  info: at("info"),
  warn: at("warn"),
  error: at("error"),
};

// Jamais e.message : il peut contenir URL ou données personnelles.
export function errorCode(e: unknown): string {
  if (!(e instanceof Error)) return "unknown";
  const { error, code } = e as Error & { error?: unknown; code?: unknown };
  const detail = typeof error === "string" ? error : typeof code === "string" ? code : undefined;
  return detail ? `${e.name}:${detail}` : e.name;
}
