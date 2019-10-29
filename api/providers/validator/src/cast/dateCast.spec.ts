import chai from 'chai';

import { dateCast } from './dateCast';

const { expect, assert } = chai;

describe('dateCast', () => {
  it('converts date full ISO', () => assert(dateCast({ data: '2019-01-01T00:00:00Z' })));
  it('converts date Y-m-d', () => assert(dateCast({ data: '2019-01-01' })));
  it('fails string', () => expect(dateCast.bind(null, { data: 'asd' })).to.throw('Invalid Date'));
  it('fails null', () => expect(dateCast.bind(null, { data: null })).to.throw('Invalid Date'));
  it('fails undefined', () => expect(dateCast.bind(null, { data: undefined })).to.throw('Invalid Date'));
});
