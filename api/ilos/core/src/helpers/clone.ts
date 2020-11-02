/**
 * Clone an object without its prototype
 */
export function clone(obj: object): object {
  if (null == obj || 'object' != typeof obj) return obj;

  const copy = obj.constructor();
  for (const attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
  }

  return copy;
}
