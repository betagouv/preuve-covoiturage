import { logger } from "./index.ts";

export type TaggedFields = Record<string, string | number | boolean | undefined>;
type Options = { allowAt?: boolean };

const MAX_VALUE_LENGTH = 64;

// Jeu de caractères sûr : pas d'espace ni de retour à la ligne, donc pas de faux champ injectable.
export function safeValue(value: string | number | boolean, options: Options = {}): string {
  const unsafe = options.allowAt ? /[^A-Za-z0-9_.@*:/-]/g : /[^A-Za-z0-9_.*:/-]/g;
  return String(value).replace(unsafe, "_").substring(0, MAX_VALUE_LENGTH);
}

export function formatTaggedLine(tag: string, step: string, fields: TaggedFields = {}, options: Options = {}): string {
  const pairs = Object.entries(fields)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}=${safeValue(v!, options)}`);
  return [tag, step, ...pairs].join(" ");
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
