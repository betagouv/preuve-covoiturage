import chai from 'chai';

import { ibanCast } from './ibanCast';

const { expect, assert } = chai;

describe('ibanCast', () => {
  it('cast proper IBAN', () => assert(ibanCast({ data: 'NL91ABNA0517164300' }) === 'NL91ABNA0517164300'));
  it('remove spaces', () => assert(ibanCast({ data: 'nl91 abna 0517 1643 00' }) === 'NL91ABNA0517164300'));
  it('cast to uppercase', () => assert(ibanCast({ data: 'nl91abna0517164300' }) === 'NL91ABNA0517164300'));
  it('fails on empty', () => expect(ibanCast.bind(null, { data: '' })).to.throw('Invalid IBAN'));
  it('fails on null', () => expect(ibanCast.bind(null, { data: null })).to.throw('Invalid IBAN'));
  it('fails on undefined', () => expect(ibanCast.bind(null, { data: undefined })).to.throw('Invalid IBAN'));
});
