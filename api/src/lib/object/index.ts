import { collections } from "@/deps.ts";

/**
 * Get the value at the given path of object.
 * If the resolved value is undefined, the defaultValue is returned in its place.
 *
 * @param obj
 * @param path
 * @param defaultValue
 * @returns
 */
export function get<TObject, TValue>(
  obj: TObject,
  path: string | string[],
  defaultValue: TValue | undefined = undefined,
): TValue | null | undefined {
  const keys = Array.isArray(path) ? path : path.split(".");
  let result: unknown = obj;

  while (keys.length) {
    const key = keys.shift()!;

    if (result === undefined) return defaultValue;
    if (result === null && keys.length) return defaultValue;
    if (key in Object(result) === false) return defaultValue;
    if (result === null && !keys.length) return null;
    result = (result as Record<string, unknown>)[key];
  }

  return result as TValue | null | undefined;
}

export function set<T>(obj: T, path: string | string[], value: any): T {
  if (Object(obj) !== obj) return obj;
  const keys = Array.isArray(path) ? path : path.split(".");
  const lastKey = keys.pop()!;

  let target: any = obj;
  for (const key of keys) {
    if (Object(target[key]) !== target[key]) {
      target[key] = typeof key === "number" ? [] : {};
    }
    target = target[key];
  }

  target[lastKey] = value;
  return obj;
}

const { omit, pick } = collections;

export { omit, pick };
