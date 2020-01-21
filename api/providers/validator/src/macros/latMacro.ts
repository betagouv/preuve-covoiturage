export function latMacro(): { type: string; coordinates: string; minimum: number; maximum: number } {
  return {
    type: 'number',
    coordinates: 'lat',
    minimum: -90,
    maximum: 90,
  };
}
