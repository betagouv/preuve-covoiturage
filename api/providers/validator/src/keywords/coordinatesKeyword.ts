export const coordinatesKeyword = {
  type: 'number',
  compile(schema: string) {
    let min: number;
    let max: number;
    let regex: RegExp;

    switch (schema) {
      case 'lon':
        min = -180;
        max = 180;
        regex = /^-?[0-9]{1,3}(\.[0-9]+)?$/;
        break;
      case 'lat':
        min = -90;
        max = 90;
        regex = /^-?[0-9]{1,2}(\.[0-9]+)?$/;
        break;
      default:
        throw new Error('Unsupported coordinate');
    }

    return (data: number | string): boolean => {
      try {
        const decimal = parseFloat(data as string);
        if (isNaN(decimal)) throw new Error(`${schema} must be a decimal`);
        if (decimal < min || decimal > max) throw new Error(`lat must be between ${min} and ${max}`);

        return regex.test(data.toString());
      } catch (e) {
        return false;
      }
    };
  },
  metaSchema: {
    type: 'string',
    enum: ['lon', 'lat'],
  },
};
