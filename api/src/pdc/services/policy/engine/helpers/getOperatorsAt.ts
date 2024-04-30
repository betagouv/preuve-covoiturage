import { OperatorsEnum } from '../../interfaces';

export type TimestampedOperators = Array<{
  date: Date;
  operators: OperatorsEnum[];
}>;

export function getOperatorsAt(list: TimestampedOperators, datetime?: Date): OperatorsEnum[] {
  if (datetime) {
    for (const { date, operators } of [...list].reverse()) {
      if (datetime.getTime() >= date.getTime()) {
        return operators;
      }
    }
  }

  // return the last one or fallback
  if (Array.isArray(list) && list.length) {
    const last = list[list.length - 1];
    if ('operators' in last) return last.operators;
  }

  return [];
}
