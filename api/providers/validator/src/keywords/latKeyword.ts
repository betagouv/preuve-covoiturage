export function latCustomFormat(data: string): boolean {
  try {
    const decimal = parseFloat(data);
    if (isNaN(decimal)) throw new Error('lat must be a decimal');
    if (decimal < -90 || decimal > 90) throw new Error('lat must be between -90 and 90');

    return /^-?[0-9]{1,2}(\.[0-9]+)?$/.test(data);
  } catch (e) {
    return false;
  }
}
