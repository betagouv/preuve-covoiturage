export function lonCustomFormat(data: string): boolean {
  try {
    const decimal = parseFloat(data);
    if (isNaN(decimal)) throw new Error('lon must be a decimal');
    if (decimal < -180 || decimal > 180) throw new Error('lon must be between -180 and 180');

    return /^-?[0-9]{1,3}(\.[0-9]+)?$/.test(data);
  } catch (e) {
    return false;
  }
}
