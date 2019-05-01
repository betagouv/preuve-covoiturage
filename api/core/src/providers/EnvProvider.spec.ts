// tslint:disable no-shadowed-variable max-classes-per-file
import { describe } from 'mocha';
import { expect } from 'chai';
import mockFs from 'mock-fs';

import { EnvProvider } from './EnvProvider';

describe('Env provider', () => {
  before(() => {
    mockFs({
      [`${process.cwd()}/.env`]: 'HELLO=world\n',
    });
  });

  after(() => {
    mockFs.restore();
  });

  it('should work', async () => {
    const envProvider = new EnvProvider();
    await envProvider.boot();
    expect(envProvider.get('HELLO')).to.equal('world');
  });

  it('should raise exception if key is not found', async () => {
    const envProvider = new EnvProvider();
    await envProvider.boot();
    expect(() => envProvider.get('HELLO2')).throws(Error, 'Unknown env key HELLO2');
  });

  it('should return fallback if key not found', async () => {
    const envProvider = new EnvProvider();
    await envProvider.boot();
    expect(envProvider.get('HELLO2', 'world')).to.equal('world');
  });
});

