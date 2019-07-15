// tslint:disable max-classes-per-file
import path from 'path';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';

import { Kernel as ParentKernel } from '@ilos/framework';
import { kernel } from '@ilos/common';

import { ServiceProvider } from './ServiceProvider';

chai.use(chaiAsPromised);
const { expect } = chai;

const configDir = process.env.APP_CONFIG_DIR ? process.env.APP_CONFIG_DIR : './config';
process.env.APP_CONFIG_DIR = path.join('..', 'dist', configDir);
process.env.APP_ENV = 'testing';
process.env.APP_MONGO_DB = '';

@kernel({
  children: [ServiceProvider],
})
class Kernel extends ParentKernel {}

describe('Crosscheck service provider', () => {
  it('boots', async () => {
    const sp = new Kernel();
    await expect(sp.register()).to.become(undefined);
    await expect(sp.init()).to.become(undefined);
    expect(sp.getContainer().get(ServiceProvider).constructor).to.eq(ServiceProvider);
  });
});
