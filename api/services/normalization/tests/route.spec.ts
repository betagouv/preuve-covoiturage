import anyTest from 'ava';
import { httpMacro } from '@pdc/helper-test';

import { bootstrap } from '../src/bootstrap';

const { test, query } = httpMacro(anyTest, () => bootstrap.boot('http', 0));

test(
  'normalization succeeds in metropole',
  query,
  'normalization:route',
  {
    passenger: {
      start: { lon: 2.264493, lat: 48.819279 },
      end: { lon: 2.341736, lat: 48.826455 },
    },
    driver: {
      start: { lon: 0.13076, lat: 47.287335 },
      end: { lon: -0.039585, lat: 48.084472 },
    },
  },
  {
    channel: {
      service: 'normalization',
      transport: 'queue',
    },
  },
  {
    result: {
      passenger: {
        calc_distance: 6903.9,
        calc_duration: 698.4,
      },
      driver: {
        calc_distance: 135530.5,
        calc_duration: 5979.6,
      },
    },
  },
);

test(
  'normalization succeeds in dom-tom',
  query,
  'normalization:route',
  {
    passenger: {
      start: { lon: 55.246518, lat: -21.042936 },
      end: { lon: 55.415603, lat: -21.246847 },
    },
    driver: {
      start: { lon: -61.066241, lat: 14.634548 },
      end: { lon: -60.937572, lat: 14.56199 },
    },
  },
  {
    channel: {
      service: 'normalization',
      transport: 'queue',
    },
  },
  {
    result: {
      passenger: {
        calc_distance: 43728.7,
        calc_duration: 2201,
      },
      driver: {
        calc_distance: 21274.2,
        calc_duration: 1776.1,
      },
    },
  },
);
