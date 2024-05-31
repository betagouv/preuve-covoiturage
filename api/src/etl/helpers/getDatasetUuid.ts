export function getDatasetUuid(producer: string, dataset: string, year: number): string {
  return `${producer}_${dataset}_${year.toString()}`;
}
