import { perimeterTypes, PerimeterType } from '../shared/geo/shared/Perimeter';

export function checkTerritoryParam(territory: PerimeterType): PerimeterType {
  return perimeterTypes.find((d) => d == territory) || 'com';
}

export function checkIndicParam(indic: string, checkArray: string[], fallback: string): string {
  return checkArray.find((d) => d == indic) || fallback;
}

export function limitNumberParamWithinRange(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}
