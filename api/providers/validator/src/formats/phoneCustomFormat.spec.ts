import test from 'ava';

import { phoneCustomFormat } from './phoneCustomFormat';

function macro(t, input: string, result: boolean) {
  t.is((phoneCustomFormat as any)(input), result);
}
macro.title = (providedTitle = '', input, expected) => `${providedTitle} ${input} = ${expected}`.trim();

test('01', macro, '01 23 45 67 89', true);
test('02', macro, '02 23 45 67 89', true);
test('03', macro, '03 23 45 67 89', true);
test('04', macro, '04 23 45 67 89', true);
test('05', macro, '05 23 45 67 89', true);
test('06', macro, '06 23 45 67 89', true);
test('07', macro, '07 33 45 67 89', true);
test('08', macro, '08 23 45 67 89', true);
test('09', macro, '09 23 45 67 89', true);
test('0800', macro, '0800 45 67 89', true);
test('spaces', macro, '01 23 45 67 89', true);
test('dots', macro, '01.23.45.67.89', true);
test('dash', macro, '01-23-45-67-89', true);
test('altogether', macro, '0123456789', true);
test('prefix 1', macro, '+33123456789', true);
test('prefix 3', macro, '+331.23.45.67.89', true);
test('prefix 4', macro, '+33(0)123456789', true);
test('prefix 5', macro, '+33 (0) 1 23 45 67 89', true);
test('belgian', macro, '+3225138940', true);
test('Guadeloupe', macro, '+590 590 82 09 30', true);
test('La Reunion', macro, '+262 2 62 41 83 00', true);
test('mobile Metropole', macro, '+33739021870', true);
test('mobile Metropole', macro, '+33749021870', true);
test('mobile Metropole', macro, '+33759021870', true);
test('mobile Metropole', macro, '+33769021870', true);
test('mobile Metropole', macro, '+33779021870', true);
test('mobile Metropole', macro, '+33789021870', true);
test('mobile Metropole', macro, '+33619021870', true);
test('mobile Metropole', macro, '+33629021870', true);
test('mobile Metropole', macro, '+33649021870', true);
test('mobile Metropole', macro, '+33669021870', true);
test('mobile Metropole', macro, '+33679021870', true);
test('mobile Metropole', macro, '+33689021870', true);
test('mobile Guadeloupe, SM, SB', macro, '+590690021870', true);
test('mobile Guadeloupe, SM, SB', macro, '+590691221870', true);
test('mobile Guyane', macro, '+594694021870', true);
test('mobile Martinique', macro, '+596696739021', true);
test('mobile La Reunion, Mayotte, Ocean Indien', macro, '+262692456789', true);
test('mobile La Reunion, Mayotte, Ocean Indien', macro, '+262693456789', true);
test('mobile La Reunion, Mayotte, Ocean Indien', macro, '+262693653300', true);
test('00 international prefix', macro, '0033123456789', true);
test('slash', macro, '01/23/45/67/89', true);
test('comma', macro, '01,23,45,67,89', false);
test('00000', macro, '0000000000', false);
test('wrong length', macro, '45 24 7000', false);
test('French mobile out of range 070', macro, '0701021870', false);
test('valid phone string intl', macro, '+33612345678', true);
test('valid phone string leading 0', macro, '0612345678', true);
test('too short', macro, '012345', false);
test('too long', macro, '00331234567890', false);
