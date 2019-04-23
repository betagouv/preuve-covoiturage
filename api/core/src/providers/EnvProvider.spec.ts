// tslint:disable no-shadowed-variable max-classes-per-file
import { describe } from 'mocha';
import { expect } from 'chai';
import mockFs from 'mock-fs';

import { EnvProvider } from './EnvProvider';

const kernel = {
  providers: [],
  services: [],
  boot() { return; },
  async handle(call) {
    return {
      id: null,
      jsonrpc: '2.0',
    };
  },
  get() { throw new Error(); },
};

describe('Env provider', () => {
  it('should work', async () => {
    mockFs({
      [`${process.cwd()}/.env`]: 'HELLO=world\n',
    });

    const envProvider = new EnvProvider(kernel);
    await envProvider.boot();
    expect(envProvider.get('HELLO')).to.equal('world');
    mockFs.restore();
  });

  it('should raise exception if key is not found', async () => {
    mockFs({
      [`${process.cwd()}/.env`]: '',
    });
    const envProvider = new EnvProvider(kernel);
    await envProvider.boot();
    try {
      envProvider.get('HELLO');
      expect(true).to.equal(false);
    } catch (e) {
      expect(e).to.be.instanceOf(Error);
      expect(e.message).to.equal('Unknown env key HELLO');
    }
    mockFs.restore();
  });

  it('should return fallback if key not found', async () => {
    const envProvider = new EnvProvider(kernel);
    await envProvider.boot();
    expect(envProvider.get('HELLO', 'world')).to.equal('world');
  });
});

