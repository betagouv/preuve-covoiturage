import test from 'ava';

import { StatelessContext } from '../entities/Context';
import { generateCarpool } from '../tests/helpers';
import { isCloseTo, haversineDistance } from './isCloseTo';

const point1 = {
  lat: 48.85042145787021,
  lon: 2.3084833042959594,
};

const point2 = {
  lat: 48.84697922091212,
  lon: 2.305294408667371,
};

const point3 = {
  lat: 48.72565703413325,
  lon: 2.261827843187402,
};

function setup(lat: number, lon: number) {
  return StatelessContext.fromCarpool(1, generateCarpool({ start_lat: lat, start_lon: lon }));
}

test('Should calculate haversine distance between two dot', (t) => {
  const calc1 = haversineDistance(point1, point2);
  t.is(Math.round(calc1), 448);
  const calc2 = haversineDistance(point1, point3);
  t.is(Math.round(calc2), 14288);
});

test('should return true if in range', async (t) => {
  const ctx = setup(point2.lat, point2.lon);
  const res = isCloseTo(ctx, { position: point1, radius: 500 });
  t.is(res, true);
});

test('should return false if not in range', async (t) => {
  const ctx = setup(point3.lat, point3.lon);
  const res = isCloseTo(ctx, { position: point1, radius: 500 });
  t.is(res, false);
});
