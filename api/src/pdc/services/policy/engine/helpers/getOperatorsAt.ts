import { OperatorsEnum } from "../../interfaces/index.ts";

export type TimestampedOperators = Array<{
  date: Date;
  operators: OperatorsEnum[];
}>;

export function getOperatorsAt(
  list: TimestampedOperators,
  datetime?: Date,
): OperatorsEnum[] {
  if (!Array.isArray(list) || !list.length) return [];

  const sorted = [...list].sort(({ date: dateA }, { date: dateB }) => {
    return dateA.getTime() > dateB.getTime() ? 1 : -1;
  });

  if (datetime) {
    for (const { date, operators } of sorted.reverse()) {
      if (datetime.getTime() >= date.getTime()) {
        return operators;
      }
    }
  }

  // return the last one or fallback
  if (Array.isArray(sorted) && sorted.length) {
    const last = sorted[sorted.length - 1];
    if ("operators" in last) return last.operators;
  }

  return [];
}
