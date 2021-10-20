import { getDefaultEndDate } from './getDefaultDates';

export function getOpenDataExportName(extension: string, inputDate?: Date): string {
  const date = inputDate ?? getDefaultEndDate();
  return `${getYearMonthString(date)}.${extension}`;
}

export function getYearMonthString(date: Date): string {
  const [year, month] = date.toJSON().split('T')[0].split('-');
  return `${year}-${month}`;
}
