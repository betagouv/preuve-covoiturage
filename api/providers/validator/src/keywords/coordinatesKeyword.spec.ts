import test from 'ava';
import { coordinatesKeyword } from './coordinatesKeyword';

function macro(t, input: { lat: number; lon: number }, expected: boolean) {
  const latResult = (coordinatesKeyword as any).compile('lat')(input.lat);
  const lonResult = (coordinatesKeyword as any).compile('lon')(input.lon);
  t.is(latResult && lonResult, expected);
}

test('valid lon and lat integer', macro, { lon: 10, lat: 10 }, true);
test('valid lon and lat decimals', macro, { lon: 1.12321373, lat: -45.1233312333333 }, true);
test('out of bounds lon 1', macro, { lon: 181, lat: 10 }, false);
test('out of bounds lon 2', macro, { lon: -181, lat: 10 }, false);
test('out of bounds lat 1', macro, { lon: 123, lat: 91 }, false);
test('out of bounds lat 2', macro, { lon: 123, lat: -91 }, false);
test('out of bounds lon and lat', macro, { lon: 1000, lat: 1000 }, false);
