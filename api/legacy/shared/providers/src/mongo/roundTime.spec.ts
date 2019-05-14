import { strict as assert } from 'assert';
import { describe, it } from 'mocha';

import roundTime from './roundTime';

const equal = (act: Date | null, exp: Date): void => {
  const actTime = act.getTime ? act.getTime() : null;
  const expTime = exp.getTime ? exp.getTime() : false;

  return assert.equal(actTime, expTime, `${act.toISOString()} / ${exp.toISOString()}`);
};

describe('round', () => {
  it('00:00', () => equal(roundTime(new Date('2019-02-23T00:00:12Z')), new Date('2019-02-23T00:00:00Z')));
  it('00:01', () => equal(roundTime(new Date('2019-02-23T00:01:12Z')), new Date('2019-02-23T00:00:00Z')));
  it('08:00', () => equal(roundTime(new Date('2019-02-23T08:00:12Z')), new Date('2019-02-23T08:00:00Z')));
  it('08:15', () => equal(roundTime(new Date('2019-02-23T08:15:12Z')), new Date('2019-02-23T08:15:00Z')));
  it('08:20', () => equal(roundTime(new Date('2019-02-23T08:20:12Z')), new Date('2019-02-23T08:15:00Z')));
  it('23:45', () => equal(roundTime(new Date('2019-02-23T23:45:12Z')), new Date('2019-02-23T23:45:00Z')));
  it('23:52', () => equal(roundTime(new Date('2019-02-23T23:52:12Z')), new Date('2019-02-23T23:45:00Z')));
  it('23:53', () => equal(roundTime(new Date('2019-02-23T23:53:12Z')), new Date('2019-02-23T23:45:00Z')));
  it('23:59', () => equal(roundTime(new Date('2019-02-23T23:59:12Z')), new Date('2019-02-23T23:45:00Z')));
});
