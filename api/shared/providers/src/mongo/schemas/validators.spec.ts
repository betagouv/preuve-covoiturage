import { strict as assert } from 'assert';
import { describe, it } from 'mocha';

const validators = require('./validators');
const setters = require('./setters');
const { assertThrows } = require('@pdc/shared-helpers').test;

describe('position', () => {
  const yep = (obj?: any) => assert(validators.position.validator(obj));
  const nope = (obj?: any) =>
    assertThrows(Error, validators.position.validator, obj);

  // tslint:disable-next-line: no-unnecessary-callback-wrapper
  it('empty', () => nope());
  it('empty object', () => nope({}));
  it('string', () => nope('abc'));
  it('integer', () => nope(1234));
  it('null', () => nope(null));
  it('missing datetime', () => nope({ lon: 2, lat: 45 }));
  it('missing lat', () => nope({ lon: 2 }));
  it('missing lon', () => nope({ lat: 45 }));
  it('lon/lat as String', () => nope({ lon: '2.123', lat: 'asvb' }));

  it('lon/lat', () => yep({ datetime: new Date(), lon: 2, lat: 45 }));
  it('insee', () => yep({ datetime: new Date(), insee: '75056' }));
  it('literal', () =>
    yep({
      datetime: new Date(),
      literal: 'Place de la République, 75003 Paris',
    }));
});

describe('phone', () => {
  const yep = (obj?: any) => assert(validators.phone.validator(obj));
  const nope = (obj?: any) =>
    assertThrows(Error, validators.phone.validator, obj);

  it('yep: 01', () => yep('01 23 45 67 89'));
  it('yep: 02', () => yep('02 23 45 67 89'));
  it('yep: 03', () => yep('03 23 45 67 89'));
  it('yep: 04', () => yep('04 23 45 67 89'));
  it('yep: 05', () => yep('05 23 45 67 89'));
  it('yep: 06', () => yep('06 23 45 67 89'));
  it('yep: 07', () => yep('07 33 45 67 89'));
  it('yep: 08', () => yep('08 23 45 67 89'));
  it('yep: 09', () => yep('09 23 45 67 89'));
  it('yep: 0800', () => yep('0800 45 67 89'));
  it('yep: spaces', () => yep('01 23 45 67 89'));
  it('yep: dots', () => yep('01.23.45.67.89'));
  it('yep: dash', () => yep('01-23-45-67-89'));
  it('yep: altogether', () => yep('0123456789'));
  it('yep: prefix 1', () => yep('+33123456789'));
  it('yep: prefix 3', () => yep('+331.23.45.67.89'));
  it('yep: prefix 4', () => yep('+33(0)123456789'));
  it('yep: prefix 5', () => yep('+33 (0) 1 23 45 67 89'));
  it('yep: belgian', () => yep('+3225138940'));
  it('yep: Guadeloupe', () => yep('+590 590 82 09 30'));
  it('yep: La Reunion', () => yep('+262 2 62 41 83 00'));
  it('yep: mobile Metropole', () => yep('+33739021870'));
  it('yep: mobile Metropole', () => yep('+33749021870'));
  it('yep: mobile Metropole', () => yep('+33759021870'));
  it('yep: mobile Metropole', () => yep('+33769021870'));
  it('yep: mobile Metropole', () => yep('+33779021870'));
  it('yep: mobile Metropole', () => yep('+33789021870'));
  it('yep: mobile Metropole', () => yep('+33619021870'));
  it('yep: mobile Metropole', () => yep('+33629021870'));
  it('yep: mobile Metropole', () => yep('+33649021870'));
  it('yep: mobile Metropole', () => yep('+33669021870'));
  it('yep: mobile Metropole', () => yep('+33679021870'));
  it('yep: mobile Metropole', () => yep('+33689021870'));
  it('yep: mobile Guadeloupe, SM, SB', () => yep('+590690021870'));
  it('yep: mobile Guadeloupe, SM, SB', () => yep('+590691221870'));
  it('yep: mobile Guyane', () => yep('+594694021870'));
  it('yep: mobile Martinique', () => yep('+596696739021'));
  it('yep: mobile La Reunion, Mayotte, Ocean Indien', () =>
    yep('+262692456789'));
  it('yep: mobile La Reunion, Mayotte, Ocean Indien', () =>
    yep('+262693456789'));

  it('nope: not international prefix', () => nope('0033123456789'));
  it('nope: comma', () => nope('01,23,45,67,89'));
  it('nope: slash', () => nope('01/23/45/67/89'));
  it('nope: 00000', () => nope('0000000000'));
  it('nope: wrong length', () => nope('45 24 7000'));
  it('nope: French mobile out of range 070', () => nope('0701021870'));
  it('nope: French mobile out of range 079', () => nope('0791021870'));
});

describe('travel pass', () => {
  const yep = (obj?: any) =>
    assert(validators.cardName.validator(setters.cardName(obj)));
  const nope = (obj?: any) =>
    assertThrows(Error, validators.cardName.validator, obj);

  it('yep navigo', () => yep('Navigo'));

  it('nope unknown', () => nope('Unknown'));
});
