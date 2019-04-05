const assert = require('assert');
const round = require('../../../src/packages/mongo/round-time');

const equal = (act, exp) => {
  const actTime = act.getTime ? act.getTime() : null;
  const expTime = exp.getTime ? exp.getTime() : false;

  return assert.equal(actTime, expTime, `${act.toISOString()} / ${exp.toISOString()}`);
};

describe('round', () => {
  it('00:00', () => equal(round(new Date('2019-02-23T00:00:12Z')), new Date('2019-02-23T00:00:00Z')));
  it('00:01', () => equal(round(new Date('2019-02-23T00:01:12Z')), new Date('2019-02-23T00:00:00Z')));
  it('08:00', () => equal(round(new Date('2019-02-23T08:00:12Z')), new Date('2019-02-23T08:00:00Z')));
  it('08:15', () => equal(round(new Date('2019-02-23T08:15:12Z')), new Date('2019-02-23T08:15:00Z')));
  it('08:20', () => equal(round(new Date('2019-02-23T08:20:12Z')), new Date('2019-02-23T08:15:00Z')));
  it('23:45', () => equal(round(new Date('2019-02-23T23:45:12Z')), new Date('2019-02-23T23:45:00Z')));
  it('23:52', () => equal(round(new Date('2019-02-23T23:52:12Z')), new Date('2019-02-23T23:45:00Z')));
  it('23:53', () => equal(round(new Date('2019-02-23T23:53:12Z')), new Date('2019-02-23T23:45:00Z')));
  it('23:59', () => equal(round(new Date('2019-02-23T23:59:12Z')), new Date('2019-02-23T23:45:00Z')));
});
