import { expect } from 'chai';

import { mapResults } from './dataWrapMiddleware';

describe('dataWrapMiddleware: mapResults', () => {
  it('skips on missing results', () => {
    const payload = {
      id: 1,
      jsonrpc: '2.0',
      error: {
        data: null,
        message: 'Server error',
        code: -32000,
      },
    };

    expect(mapResults(payload)).to.deep.eq(payload);
  });

  it('returns doc on existing data/meta', () => {
    const payload = {
      id: 1,
      jsonrpc: '2.0',
      result: {
        data: {
          data: 'meta',
        },
        meta: {
          meta: 'data',
        },
      },
    };

    expect(mapResults(payload)).to.deep.eq(payload);
  });

  it('returns doc with added meta: null if missing', () => {
    const payload = {
      id: 1,
      jsonrpc: '2.0',
      result: {
        data: {
          data: 'meta',
        },
      },
    };

    const expectation = {
      id: 1,
      jsonrpc: '2.0',
      result: {
        meta: null,
        data: {
          data: 'meta',
        },
      },
    };

    expect(mapResults(payload)).to.deep.eq(expectation);
  });

  it('wraps result with data/meta if missing', () => {
    const payload = {
      id: 1,
      jsonrpc: '2.0',
      result: {
        _id: 1234,
      },
    };

    const expectation = {
      id: 1,
      jsonrpc: '2.0',
      result: {
        meta: null,
        data: {
          _id: 1234,
        },
      },
    };

    expect(mapResults(payload)).to.deep.eq(expectation);
  });
});
