export function lonMacro(): { type: string; coordinates: string; minimum: number; maximum: number } {
  return {
    type: 'number',
    coordinates: 'lon',
    minimum: -180,
    maximum: 180,
  };
}
