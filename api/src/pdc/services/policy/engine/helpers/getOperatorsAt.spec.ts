import test from 'ava';
import { OperatorsEnum } from '../../interfaces';
import { TimestampedOperators, getOperatorsAt } from './getOperatorsAt';

// Unit test the getOperators method based on GrandPoitiers configuration

const list: TimestampedOperators = [
  {
    date: new Date('2023-09-27T00:00:00+0200'),
    operators: [OperatorsEnum.KAROS],
  },
  {
    date: new Date('2023-10-16T00:00:00+0200'),
    operators: [OperatorsEnum.KAROS, OperatorsEnum.MOBICOOP],
  },
  {
    date: new Date('2023-12-22T00:00:00+0100'),
    operators: [OperatorsEnum.KAROS, OperatorsEnum.MOBICOOP, OperatorsEnum.BLABLACAR_DAILY, OperatorsEnum.KLAXIT],
  },
];

test('missing operators returns empty array', (t) => {
  t.deepEqual(getOperatorsAt(undefined), []);
});

test('should return the last operators if no datetime is provided', (t) => {
  t.deepEqual(getOperatorsAt([...list]), [
    OperatorsEnum.KAROS,
    OperatorsEnum.MOBICOOP,
    OperatorsEnum.BLABLACAR_DAILY,
    OperatorsEnum.KLAXIT,
  ]);
});

test('should return Karos only if datetime is before 16/10/2023', (t) => {
  t.deepEqual(getOperatorsAt([...list], new Date('2023-10-15')), [OperatorsEnum.KAROS]);
});

test('should return Karos and Mobicoop if datetime is after 16/10/2023', (t) => {
  t.deepEqual(getOperatorsAt([...list], new Date('2023-10-17')), [OperatorsEnum.KAROS, OperatorsEnum.MOBICOOP]);
});

test('should return all operators if datetime is after 22/12/2023', (t) => {
  t.deepEqual(getOperatorsAt([...list], new Date('2023-12-23')), [
    OperatorsEnum.KAROS,
    OperatorsEnum.MOBICOOP,
    OperatorsEnum.BLABLACAR_DAILY,
    OperatorsEnum.KLAXIT,
  ]);
});
