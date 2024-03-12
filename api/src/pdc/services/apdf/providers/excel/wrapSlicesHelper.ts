import { BoundedSlices, UnboundedSlices } from '@shared/policy/common/interfaces/Slices';

export function wrapSlices(slices: BoundedSlices | UnboundedSlices | undefined | null): UnboundedSlices | [] {
  if (!slices || !Array.isArray(slices) || !slices.length) return [];
  const bounded = toBoundedSlices(slices);
  const min = findBoundary('min', bounded);
  const max = findBoundary('max', bounded);
  if (min === 0) return [...bounded, { start: max }];
  return [{ start: 0, end: min }, ...bounded, { start: max }];
}

export function toBoundedSlices(slices: BoundedSlices | UnboundedSlices): BoundedSlices {
  const sorted = slices.sort(({ start: a }, { start: b }) => a - b);
  return (sorted[sorted.length - 1]?.end ? slices : sorted.slice(0, sorted.length - 1)) as BoundedSlices;
}

export function findBoundary(boundary: 'min' | 'max', slices: BoundedSlices): number | null {
  // FIXME
  // Hack to handle the case where the slice is unbounded and the SQL uses 'Infinity'
  // Behaviour seems buggy but it is used by one ended campaign only.
  // @ts-ignore
  if (boundary === 'max') return slices.reduce((min, { end }) => (min < end ? end : min), "'-Infinity'");
  // @ts-ignore
  return slices.reduce((min, { start }) => (min > start ? start : min), "'Infinity'");
}
