import { errorCode, formatTaggedLine, taggedLogger } from "@/lib/logger/tagged.ts";

// Brand : seuls maskEmail/maskSiren produisent un Masked, un email/siren en clair ne compile pas.
export type Masked = string & { readonly __masked: unique symbol };

export type ProconnectFields = {
  attempt?: string;
  session?: string;
  user_id?: number;
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
  return formatTaggedLine("[proconnect]", step, fields, { allowAt: true });
}

export const proconnectLog = taggedLogger<ProconnectFields>("[proconnect]", { allowAt: true });

export { errorCode };
