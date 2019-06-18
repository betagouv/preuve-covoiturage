export function latMacro(schema) {
  return {
    type: 'number',
    coordinates: 'lat',
    minimum: -90,
    maximum: 90,
  };
}
