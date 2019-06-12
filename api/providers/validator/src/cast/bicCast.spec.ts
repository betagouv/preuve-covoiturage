import chai from 'chai';

import { bicCast } from './bicCast';

const { expect, assert } = chai;

describe('bicCast', () => {
  it('cast proper BIC', () => assert(bicCast({ data: 'ABNANL2A' }) === 'ABNANL2A'));
  it('remove spaces', () => assert(bicCast({ data: 'ned sza jj xxx' }) === 'NEDSZAJJXXX'));
  it('remove dashes', () => assert(bicCast({ data: 'ned-sza-jj-xxx' }) === 'NEDSZAJJXXX'));
  it('cast to uppercase', () => assert(bicCast({ data: 'nedszajjxxx' }) === 'NEDSZAJJXXX'));
  it('fails on empty', () => expect(bicCast.bind(null, { data: '' })).to.throw('Invalid BIC'));
  it('fails on null', () => expect(bicCast.bind(null, { data: null })).to.throw('Invalid BIC'));
  it('fails on undefined', () => expect(bicCast.bind(null, { data: undefined })).to.throw('Invalid BIC'));
});
