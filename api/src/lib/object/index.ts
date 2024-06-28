import { collections } from "@/deps.ts";

export function get<T, K extends keyof T>(
  obj: T,
  path: string | string[],
  defaultValue?: any,
): any {
  const keys = Array.isArray(path) ? path : path.split(".");
  let result: any = obj;

  for (const key of keys) {
    result = result[key as K];
    if (result === undefined) {
      return defaultValue;
    }
  }

  return result;
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
