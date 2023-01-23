import { SliceInterface } from '../shared/policy/common/interfaces/SliceInterface';

export function boundariesToClause(bnd: SliceInterface): string {
  const bndStart = bnd.start > -1 ? ` and distance >= ${bnd.start}` : '';
  const bndEnd = bnd.end > -1 ? ` and distance < ${bnd.end}` : '';
  return `${bndStart}${bndEnd}`;
}
