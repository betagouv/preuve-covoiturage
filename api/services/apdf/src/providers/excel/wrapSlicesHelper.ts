import { BoundedSlices, UnboundedSlices } from '../../shared/policy/common/interfaces/SliceInterface';

export function wrapSlicesHelper(slices: BoundedSlices | undefined | null): UnboundedSlices | [] {
  if (!slices || !Array.isArray(slices) || !slices.length) return [];
  const min = findBoundary('min', slices);
  const max = findBoundary('max', slices);
  if (min === 0) return [...slices, { start: max }];
  return [{ start: 0, end: min }, ...slices, { start: max }];
}

export function findBoundary(boundary: 'min' | 'max', slices: BoundedSlices): number | null {
  if (boundary === 'max') return slices.reduce((min, { end }) => (min < end ? end : min), -Infinity);
  return slices.reduce((min, { start }) => (min > start ? start : min), Infinity);
}
