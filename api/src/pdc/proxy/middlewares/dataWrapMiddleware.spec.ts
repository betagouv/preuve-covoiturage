import test from 'ava';

import { mapResults } from './dataWrapMiddleware';

test('[mapResults] skips on missing results', (t) => {
  const payload = {
    id: 1,
    jsonrpc: '2.0',
    error: {
      data: null,
      message: 'Server error',
      code: -32000,
    },
  };

  t.deepEqual(mapResults(payload), payload);
});

test('[mapResults] returns doc on existing data/meta', (t) => {
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

  t.deepEqual(mapResults(payload), payload);
});

test('[mapResults] returns doc with added meta: null if missing', (t) => {
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

  t.deepEqual(mapResults(payload), expectation);
});

test('[mapResults] wraps result with data/meta if missing', (t) => {
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

  t.deepEqual(mapResults(payload), expectation);
});

test('[mapResults] succeeds on non-object results (boolean)', (t) => {
  const payload = {
    id: 1,
    jsonrpc: '2.0',
    result: true,
  };

  const expectation = {
    id: 1,
    jsonrpc: '2.0',
    result: {
      meta: null,
      data: true,
    },
  };

  t.deepEqual(mapResults(payload), expectation);
});

test('[mapResults] succeeds on non-object results (string)', (t) => {
  const payload = {
    id: 1,
    jsonrpc: '2.0',
    result: 'Hello World!',
  };

  const expectation = {
    id: 1,
    jsonrpc: '2.0',
    result: {
      meta: null,
      data: 'Hello World!',
    },
  };

  t.deepEqual(mapResults(payload), expectation);
});
