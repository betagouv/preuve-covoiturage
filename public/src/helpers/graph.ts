import { PeriodType } from "../interfaces/observatoire/componentsInterfaces";
import { monthList, semesterList, trimesterList, yearList } from "./lists";

export const chartLabels = (
  data: Record<string, number>[],
  period: PeriodType,
) => {
  const labels: string[] = [];
  switch (period) {
    case "month":
      data.map((d) => {
        const period = monthList.find((l) => l.id == d.month);
        labels.push(`${period ? period.name : ""} ${d.year}`);
      });
      break;
    case "trimester":
      data.map((d) => {
        const period = trimesterList.find((l) => l.id == d.trimester);
        labels.push(`${period ? period.name : ""} ${d.year}`);
      });
      break;
    case "semester":
      data.map((d) => {
        const period = semesterList.find((l) => l.id == d.semester);
        labels.push(`${period ? period.name : ""} ${d.year}`);
      });
      break;
    case "year":
      data.map((d) => {
        const period = yearList.find((l) => l.id == d.year);
        labels.push(`${period ? period.name : ""}`);
      });
      break;
  }
  return labels.reverse();
};
