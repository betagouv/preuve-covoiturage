import { logger } from "./index.ts";

export type TaggedFields = Record<string, string | number | boolean | undefined>;
// maxLength : 64 par défaut (chemin de requête) ; les outils batch relèvent la limite pour garder une erreur SQL lisible.
type Options = { allowAt?: boolean; maxLength?: number };

const MAX_VALUE_LENGTH = 64;

// Jeu de caractères sûr : pas d'espace ni de retour à la ligne, donc pas de faux champ injectable.
export function safeValue(value: string | number | boolean, options: Options = {}): string {
  const unsafe = options.allowAt ? /[^A-Za-z0-9_.@*:/-]/g : /[^A-Za-z0-9_.*:/-]/g;
  return String(value).replace(unsafe, "_").substring(0, options.maxLength ?? MAX_VALUE_LENGTH);
}

// Position arrondie à ~1 km : assez pour diagnostiquer, pas pour réidentifier.
export const coarse = (v: number): number => Math.round(v * 100) / 100;

export function formatTaggedLine(tag: string, step: string, fields: TaggedFields = {}, options: Options = {}): string {
  const pairs = Object.entries(fields)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}=${safeValue(v!, options)}`);
  return [tag, step, ...pairs].join(" ");
}

// Jamais e.message ni e.stack dans les logs de requête : ils peuvent porter des données personnelles.
export function errorCode(e: unknown): string {
  if (!(e instanceof Error)) return "unknown";
  const { rpcError, code, error } = e as Error & { rpcError?: { code?: unknown }; code?: unknown; error?: unknown };
  const detail = [rpcError?.code, error, code].find((v) => typeof v === "string" || typeof v === "number");
  const name = e.constructor.name !== "Object" ? e.constructor.name : e.name;
  return detail === undefined ? name : `${name}:${detail}`;
}

type Level = "debug" | "info" | "warn" | "error";
type LogMethod<F extends TaggedFields> = (step: string, fields?: F) => void;

export function taggedLogger<F extends TaggedFields = TaggedFields>(
  tag: string,
  options: Options = {},
): Record<Level, LogMethod<F>> {
  const at = (level: Level): LogMethod<F> => (step, fields) =>
    logger[level](formatTaggedLine(tag, step, fields, options));
  return { debug: at("debug"), info: at("info"), warn: at("warn"), error: at("error") };
}
