import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';

import { phoneCustomFormat } from './phoneCustomFormat.ts';

function macro(t, input: string, result: boolean) {
  assertEquals((phoneCustomFormat as any)(input), result);
}
macro.title = (providedTitle = '', input, expected) => `${providedTitle} ${input} = ${expected}`.trim();

it('01', macro, '01 23 45 67 89', true);
it('02', macro, '02 23 45 67 89', true);
it('03', macro, '03 23 45 67 89', true);
it('04', macro, '04 23 45 67 89', true);
it('05', macro, '05 23 45 67 89', true);
it('06', macro, '06 23 45 67 89', true);
it('07', macro, '07 33 45 67 89', true);
it('08', macro, '08 23 45 67 89', true);
it('09', macro, '09 23 45 67 89', true);
it('0800', macro, '0800 45 67 89', true);
it('spaces', macro, '01 23 45 67 89', true);
it('dots', macro, '01.23.45.67.89', true);
it('dash', macro, '01-23-45-67-89', true);
it('altogether', macro, '0123456789', true);
it('prefix 1', macro, '+33123456789', true);
it('prefix 3', macro, '+331.23.45.67.89', true);
it('prefix 4', macro, '+33(0)123456789', true);
it('prefix 5', macro, '+33 (0) 1 23 45 67 89', true);
it('belgian', macro, '+3225138940', true);
it('Guadeloupe', macro, '+590 590 82 09 30', true);
it('La Reunion', macro, '+262 2 62 41 83 00', true);
it('mobile Metropole', macro, '+33739021870', true);
it('mobile Metropole', macro, '+33749021870', true);
it('mobile Metropole', macro, '+33759021870', true);
it('mobile Metropole', macro, '+33769021870', true);
it('mobile Metropole', macro, '+33779021870', true);
it('mobile Metropole', macro, '+33789021870', true);
it('mobile Metropole', macro, '+33619021870', true);
it('mobile Metropole', macro, '+33629021870', true);
it('mobile Metropole', macro, '+33649021870', true);
it('mobile Metropole', macro, '+33669021870', true);
it('mobile Metropole', macro, '+33679021870', true);
it('mobile Metropole', macro, '+33689021870', true);
it('mobile Guadeloupe, SM, SB', macro, '+590690021870', true);
it('mobile Guadeloupe, SM, SB', macro, '+590691221870', true);
it('mobile Guyane', macro, '+594694021870', true);
it('mobile Martinique', macro, '+596696739021', true);
it('mobile La Reunion, Mayotte, Ocean Indien', macro, '+262692456789', true);
it('mobile La Reunion, Mayotte, Ocean Indien', macro, '+262693456789', true);
it('mobile La Reunion, Mayotte, Ocean Indien', macro, '+262693653300', true);
it('mobile La Reunion, Mayotte, Ocean Indien', macro, '+262693054400', true);
it('00 international prefix', macro, '0033123456789', true);
it('slash', macro, '01/23/45/67/89', true);
it('comma', macro, '01,23,45,67,89', false);
it('00000', macro, '0000000000', false);
it('wrong length', macro, '45 24 7000', false);
// next test is disabled because libphonenumber-js is not compliant
//.test('French mobile out of range 070', macro, '0701021870', false);
it('valid phone string intl', macro, '+33612345678', true);
it('valid phone string leading 0', macro, '0612345678', true);
it('too short', macro, '012345', false);
it('too long', macro, '00331234567890', false);
