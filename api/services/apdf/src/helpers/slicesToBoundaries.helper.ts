import { SliceInterface } from '../shared/policy/common/interfaces/SliceInterface';

export function slicesToBoundaries(slices: SliceInterface[], t?): SliceInterface {
  const start = Math.min(...sortList(slices.map(({ start: s }) => s)));
  const end = Math.max(...sortList(slices.map(({ end: e }) => e)));

  // invert results to have increasing boundaries
  if (start > end && end > -1) return { start: end, end: start };

  return { start, end };
}

function sortList(list: any[]): number[] {
  const l = list.filter((i) => typeof i === 'number').sort((a, b) => a - b);
  return l.length ? list : [-1];
}
