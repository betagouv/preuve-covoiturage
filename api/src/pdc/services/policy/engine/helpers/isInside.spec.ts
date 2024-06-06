import test from 'ava';

import { StatelessContext } from '../entities/Context.ts';
import { generateCarpool } from '../tests/helpers.ts';
import type { GeoJSON } from '@/shared/geo/GeoJson.ts';
import { isInside } from './isInside.ts';

const shape: GeoJSON = {
  type: 'Polygon',
  coordinates: [
    [
      [2.267006795730566, 48.857559923352795],
      [2.345063276456358, 48.89068781595449],
      [2.4064931099845808, 48.86853356857932],
      [2.3879981063420246, 48.83028355666028],
      [2.3159996993031484, 48.82289098210819],
      [2.267006795730566, 48.857559923352795],
    ],
  ],
};

const point1 = {
  lat: 48.85042145787021,
  lon: 2.3084833042959594,
};

const point2 = {
  lat: 48.72565703413325,
  lon: 2.261827843187402,
};

function setup(lat: number, lon: number) {
  return StatelessContext.fromCarpool(1, generateCarpool({ start_lat: lat, start_lon: lon }));
}

test('Should return true if point is in shape', (t) => {
  const ctx = setup(point1.lat, point1.lon);
  const res = isInside(ctx, { shape });
  t.is(res, true);
});

test('Should return false if point is not in shape', (t) => {
  const ctx = setup(point2.lat, point2.lon);
  const res = isInside(ctx, { shape });
  t.is(res, false);
});
