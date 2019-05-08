const assert = require('assert');
const regex = require('./regex');

const yep = (r, n) => assert(r.test(n));
const nope = (r, n) => assert(!r.test(n));

describe('phone', () => {
  it('yep: 01', () => yep(regex.phone, '01 23 45 67 89'));
  it('yep: 02', () => yep(regex.phone, '02 23 45 67 89'));
  it('yep: 03', () => yep(regex.phone, '03 23 45 67 89'));
  it('yep: 04', () => yep(regex.phone, '04 23 45 67 89'));
  it('yep: 05', () => yep(regex.phone, '05 23 45 67 89'));
  it('yep: 06', () => yep(regex.phone, '06 23 45 67 89'));
  it('yep: 07', () => yep(regex.phone, '07 23 45 67 89'));
  it('yep: 08', () => yep(regex.phone, '08 23 45 67 89'));
  it('yep: 09', () => yep(regex.phone, '09 23 45 67 89'));
  it('yep: 0800', () => yep(regex.phone, '0800 45 67 89'));
  it('yep: spaces', () => yep(regex.phone, '01 23 45 67 89'));
  it('yep: dots', () => yep(regex.phone, '01.23.45.67.89'));
  it('yep: dash', () => yep(regex.phone, '01-23-45-67-89'));
  it('yep: altogether', () => yep(regex.phone, '0123456789'));
  it('yep: prefix 2', () => yep(regex.phone, '+33123456789'));
  it('yep: prefix 3', () => yep(regex.phone, '+331.23.45.67.89'));
  it('yep: prefix 4', () => yep(regex.phone, '+33(0)123456789'));
  it('yep: prefix 5', () => yep(regex.phone, '+33 (0) 1 23 45 67 89'));
  it('yep: belgian', () => yep(regex.phone, '+3225138940'));
  it('yep: reunion', () => yep(regex.phone, '+262262456789'));

  it('nope: not international prefix', () => nope(regex.phone, '0033123456789'));
  it('nope: comma', () => nope(regex.phone, '01,23,45,67,89'));
  it('nope: slash', () => nope(regex.phone, '01/23/45/67/89'));
  it('nope: 00000', () => nope(regex.phone, '0000000000'));
  it('nope: wrong length', () => nope(regex.phone, '45 24 7000'));
});

describe('insee', () => {
  it('yep', () => yep(regex.insee, '01001'));
  it('yep', () => yep(regex.insee, '97132'));
  it('yep', () => yep(regex.insee, '2A100'));
  it('yep', () => yep(regex.insee, '2B152'));

  it('nope', () => nope(regex.insee, '2C152'));
  it('nope', () => nope(regex.insee, '8152'));
  it('nope', () => nope(regex.insee, '100000'));
  it('nope', () => nope(regex.insee, 'ABCAD'));
});

describe('postcode', () => {
  it('yep', () => yep(regex.postcode, '01001'));
  it('yep', () => yep(regex.postcode, '97132'));
  it('yep', () => yep(regex.postcode, '2A100'));
  it('yep', () => yep(regex.postcode, '2B152'));
  it('nope', () => yep(regex.postcode, '8152')); // Suisse

  it('nope', () => nope(regex.postcode, '2C152'));
  it('nope', () => nope(regex.postcode, '100000'));
  it('nope', () => nope(regex.postcode, 'ABCAD'));
});

describe('lon', () => {
  it('yep', () => yep(regex.lon, 0));
  it('yep', () => yep(regex.lon, 180));
  it('yep', () => yep(regex.lon, -180));
  it('yep', () => yep(regex.lon, 0.12313));
  it('yep', () => yep(regex.lon, -13.123));
  it('yep', () => yep(regex.lon, '-13.123'));

  it('nope', () => nope(regex.lon, null));
  it('nope', () => nope(regex.lon, undefined));
  it('nope', () => nope(regex.lon, {}));
  it('nope', () => nope(regex.lon, []));
  it('nope', () => nope(regex.lon, '1.123N'));
  it('nope', () => nope(regex.lon, 'A'));
  it('nope', () => nope(regex.lon, '23"12\'123°)'));
  it('nope', () => nope(regex.lon, 12333));
  it('nope', () => nope(regex.lon, -3601));
});

describe('lat', () => {
  it('yep', () => yep(regex.lat, 0));
  it('yep', () => yep(regex.lat, 90));
  it('yep', () => yep(regex.lat, -90));
  it('yep', () => yep(regex.lat, 0.12313));
  it('yep', () => yep(regex.lat, -13.123));
  it('yep', () => yep(regex.lat, '-13.123'));

  it('nope', () => nope(regex.lat, null));
  it('nope', () => nope(regex.lat, undefined));
  it('nope', () => nope(regex.lat, {}));
  it('nope', () => nope(regex.lat, []));
  it('nope', () => nope(regex.lat, '1.123N'));
  it('nope', () => nope(regex.lat, 'A'));
  it('nope', () => nope(regex.lat, '23"12\'123°)'));
  it('nope', () => nope(regex.lat, 12333));
  it('nope', () => nope(regex.lat, 180));
  it('nope', () => nope(regex.lat, -180));
});
