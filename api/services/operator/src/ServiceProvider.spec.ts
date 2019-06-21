// tslint:disable max-classes-per-file
import path from 'path';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
const { expect } = chai;

process.env.APP_WORKING_PATH = path.resolve(process.cwd(), 'dist');
process.env.APP_ENV = 'testing';
process.env.APP_MONGO_DB = '';

describe('Operator service provider', () => {
  it('boots', async () => {
    expect(true).to.eq(true);
    // TODO: add config + env provider
    // const sp = new ServiceProvider();
    // await expect(sp.boot()).to.become(undefined);
  });
});
