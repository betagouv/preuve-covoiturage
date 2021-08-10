export function getOpenDataExportName(extension: string, inputDate?: Date): string {
  const defaultDate = new Date();
  defaultDate.setDate(1);
  defaultDate.setHours(0, 0, 0, -1);

  const date = inputDate ?? defaultDate;
  const [year, month] = date.toJSON().split('T')[0].split('-');
  return `${year}-${month}.${extension}`;
}
