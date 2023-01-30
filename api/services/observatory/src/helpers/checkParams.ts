export function checkTerritoryParam(territory: string): string {
  const checkArray = ['com', 'epci', 'aom', 'dep', 'reg', 'country'];
  return checkArray.find((d) => d == territory) || 'com';
}

export function checkIndicParam(indic: string, checkArray: string[], callback: string): string {
  return checkArray.find((d) => d == indic) || callback;
}
