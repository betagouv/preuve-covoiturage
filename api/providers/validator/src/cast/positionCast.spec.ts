import chai from 'chai';
import { isNumber } from 'lodash';

import { positionCast } from './positionCast';

const { assert } = chai;

describe('positionCast: datetime', () => {
  it('converts date full ISO', () => {
    const { datetime } = positionCast({ data: { datetime: '2019-01-01T00:00:00Z' } });
    // tslint:disable-next-line: prefer-type-cast
    assert(datetime instanceof Date && !isNaN(datetime as any));
  });
});

describe('positionCast: lon', () => {
  it('converts string', () => {
    const { lon } = positionCast({ data: { lon: '1.23' } });
    assert(isNumber(lon));
  });
  it('converts number', () => {
    const { lon } = positionCast({ data: { lon: 1.23 } });
    assert(isNumber(lon));
  });
});

describe('positionCast: lat', () => {
  it('converts string', () => {
    const { lat } = positionCast({ data: { lat: '1.23' } });
    assert(isNumber(lat));
  });
  it('converts number', () => {
    const { lat } = positionCast({ data: { lat: 1.23 } });
    assert(isNumber(lat));
  });
});

describe('positionCast: insee', () => {
  it('converts string', () => {
    const { insee } = positionCast({ data: { insee: '2A123' } });
    assert(insee === '2A123');
  });
  it('converts string', () => {
    const { insee } = positionCast({ data: { insee: '75101' } });
    assert(insee === '75101');
  });
  it('converts number 75101', () => {
    const { insee } = positionCast({ data: { insee: 75101 } });
    assert(insee === '75101');
  });
  it('converts number 08100', () => {
    const { insee } = positionCast({ data: { insee: 8100 } });
    assert(insee === '08100');
  });
});

describe('positionCast: literal', () => {
  it('converts string', () => {
    const { literal } = positionCast({ data: { literal: 'Trifouilly-les-oies' } });
    assert(literal === 'Trifouilly-les-oies');
  });
  it('converts empty', () => {
    const { literal } = positionCast({ data: { literal: null } });
    assert(literal === '');
  });
});
