import { isNumber } from 'lodash';

import { PositionType } from '../types/position';

const castInsee = (i: string | number): string => {
  if (isNumber(i) && i < 10000) {
    return `0${i}`;
  }

  return `${i}`.trim();
};

export function positionCast({ data }: { data: any }): PositionType {
  const d: PositionType = {
    datetime: new Date(data.datetime),
  };

  d.lon = parseFloat(data.lon);
  d.lat = parseFloat(data.lat);
  d.insee = castInsee(data.insee);
  d.literal = `${data.literal || ''}`.trim();

  return d;
}
