export function lonMacro(schema) {
  return {
    type: 'number',
    coordinates: 'lon',
    minimum: -180,
    maximum: 180,
  };
}
