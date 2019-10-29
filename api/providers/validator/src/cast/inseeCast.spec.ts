import chai from 'chai';

import { inseeCast } from './inseeCast';

const { expect, assert } = chai;

describe('inseeCast', () => {
  it('cast proper insee', () => assert(inseeCast({ data: '75101' }) === '75101'));
  it('cast number', () => assert(inseeCast({ data: 75101 as any }) === '75101'));
  it('cast number missing leading 0', () => assert(inseeCast({ data: 8000 as any }) === '08000'));
  it('cast to uppercase', () => assert(inseeCast({ data: '2a123' }) === '2A123'));
  it('fails on empty', () => expect(inseeCast.bind(null, { data: '' })).to.throw('Invalid INSEE code'));
  it('fails on null', () => expect(inseeCast.bind(null, { data: null })).to.throw('Invalid INSEE code'));
  it('fails on undefined', () => expect(inseeCast.bind(null, { data: undefined })).to.throw('Invalid INSEE code'));
});
