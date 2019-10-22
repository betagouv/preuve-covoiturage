export function hasOneNotEmptyProperty(object: any, maxRec = 3) {
  if (!object) return false;

  let hasNonEmpty = false;
  const values = Object.values(object);

  for (const val of values) {
    if (val) {
      if (typeof val === 'object') {
        if (maxRec) {
          hasNonEmpty = hasOneNotEmptyProperty(val, maxRec - 1);
        }
      } else {
        hasNonEmpty = true;
      }
      if (hasNonEmpty) break;
    }
  }

  return hasNonEmpty;
}
