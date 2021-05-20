export enum GraphTimeMode {
  Month = "month",
  Day = "day",
  Cumulative = "cumulative",
}

export const GraphTimeModeLabel: { [key: string]: string } = {
  [GraphTimeMode.Cumulative]: "Cumulée",
  [GraphTimeMode.Day]: "Par jour",
  [GraphTimeMode.Month]: "Par mois",
};

export const GraphTimeModeNavList: GraphTimeMode[] = [
  GraphTimeMode.Cumulative,
  GraphTimeMode.Day,
  GraphTimeMode.Month,
];
