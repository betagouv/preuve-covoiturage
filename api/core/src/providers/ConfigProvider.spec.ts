// tslint:disable no-shadowed-variable max-classes-per-file no-invalid-this
import { describe } from 'mocha';
import { expect } from 'chai';
import mockFs from 'mock-fs';

import { ConfigProvider } from './ConfigProvider';
import { EnvProvider } from './EnvProvider';

class FakeEnvProvider extends EnvProvider {
  boot() {
    return;
  }

  get(key: string, fallback?: any): any {
    return fallback;
  }
}

describe('Config provider', () => {
  it('should work with yaml', async () => {
    mockFs({
      [`${process.cwd()}/config/hello-world.yml`]: `
        hi:\n
            - name: 'john' \n
        \n`,
    });

    const configProvider = new ConfigProvider(new FakeEnvProvider());
    await configProvider.boot();
    expect(configProvider.get('helloWorld')).to.deep.equal({
      hi: [
        { name: 'john' },
      ],
    });

    mockFs.restore();
  });

  it('should work with js', async () => {
    mockFs({
      [`${process.cwd()}/config/hello-world.js`]: `module.exports.hi = [
        {
          name: env('FAKE', 'john'),
        },
      ];
      module.exports.test = false;`,
    });

    const configProvider = new ConfigProvider(new FakeEnvProvider());
    await configProvider.boot();
    expect(configProvider.get('helloWorld')).to.deep.include({
      hi: [
        { name: 'john' },
      ],
    });

    mockFs.restore();
  });

  it('should return fallback if key not found', async () => {
    const configProvider = new ConfigProvider(new FakeEnvProvider());
    await configProvider.boot();
    expect(configProvider.get('hello', 'world')).to.equal('world');
  });
});
