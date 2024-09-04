import { StatInterface } from "../interfaces/StatInterface.ts";
import { ApiGraphTimeMode } from "@/shared/trip/common/interfaces/ApiGraphTimeMode.ts";
import {
  ParamsInterface,
  ResultInterface,
} from "@/shared/trip/stats.contract.ts";

export function fillWithZeroes(
  result: StatInterface[],
  params: ParamsInterface,
): ResultInterface {
  // results for totals don't need filling
  if (params.group_by === ApiGraphTimeMode.All) return result;

  // fill empty days or months with 0 values to avoid gaps in the charts
  return dateRange(params.group_by, params.date.start, params.date.end).map(
    (item) => {
      const emptyRow = {
        trip: 0,
        distance: 0,
        carpoolers: 0,
        operators: 0,
        average_carpoolers_by_car: 0,
        trip_subsidized: 0,
        financial_incentive_sum: 0,
        incentive_sum: 0,
      };

      // set 'day' or 'month' prop
      emptyRow[params.group_by] = item;

      // search for matching month or day or replace by default values
      return result.find((row) => row[params.group_by] === item) || emptyRow;
    },
  );
}

function dateRange(type: ApiGraphTimeMode, start: Date, end: Date): string[] {
  const arr = [];
  const len = type === "day" ? 10 : 7;
  const fn = type === "day" ? "Date" : "Month";

  start = new Date(start);
  end = new Date(end);

  if (type === "month") {
    start.setDate(1);
  }

  while (start <= end) {
    arr.push(start.toISOString().substr(0, len));
    start = new Date(start[`set${fn}`](start[`get${fn}`]() + 1));
  }

  return arr;
}
