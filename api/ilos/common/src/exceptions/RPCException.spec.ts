import test from 'ava';
import { RPCErrorData, RPCErrorLevel } from '../types';
import { RPCException } from './RPCException';

// Create a dummy class the same way App Exceptions are done
class TestError extends RPCException {
  constructor(data: RPCErrorData = undefined) {
    super(12345, data);
  }
}

test('No args falls to constructor name - throw', (t) => {
  t.throws(
    () => {
      throw new TestError();
    },
    { instanceOf: TestError, code: 12345, name: 'TestError', message: 'TestError' },
  );
});

test('No args falls to constructor name - check', (t) => {
  const code = 12345;
  const name = 'TestError';
  const error = new TestError();

  t.is(error.code, code);
  t.is(error.name, name);
  t.is(error.level, RPCErrorLevel.ERROR); // default level
  t.is(error.message, name);
  t.true('rpcError' in error);
});

test('A custom string is used as message - throw', (t) => {
  t.throws(
    () => {
      throw new TestError('Some custom error string');
    },
    { instanceOf: TestError, code: 12345, name: 'TestError', message: 'Some custom error string' },
  );
});

test('A custom string is used as message - check', (t) => {
  const code = 12345;
  const name = 'TestError';
  const message = 'Some custom error string';
  const error = new TestError(message);

  t.is(error.code, code);
  t.is(error.name, name);
  t.is(error.level, RPCErrorLevel.ERROR); // default level
  t.is(error.message, message);
  t.true('rpcError' in error);
});

test('Passing a level to the Error', (t) => {
  const code = 12345;
  const name = 'TestError';
  const level = RPCErrorLevel.DEBUG;
  const message = 'Some custom error string';
  const error = new TestError({ level, message });

  t.is(error.code, code);
  t.is(error.name, name);
  t.is(error.level, level);
  t.is(error.message, message);
  t.true('rpcError' in error);
});

test('Checking legacy rpcError object', (t) => {
  const code = 12345;
  const name = 'TestError';
  const level = RPCErrorLevel.DEBUG;
  const message = 'Some custom error string';
  const error = new TestError({ level, message, extra: { stuff: 'cool' }, n: 1, s: 'yolo' });

  t.is(error.code, code);
  t.is(error.name, name);
  t.is(error.level, level);
  t.is(error.message, message);

  // testing legacy rpcError structure
  t.true('rpcError' in error);
  t.deepEqual(error.rpcError, {
    code,
    message,
    data: { message, code, level, extra: { stuff: 'cool' }, n: 1, s: 'yolo' },
  });
});
