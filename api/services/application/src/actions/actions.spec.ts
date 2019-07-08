// tslint:disable: no-unused-expression
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';

import { MockApplicationRepository } from '../../tests/mocks/MockApplicationRepository';

import { Application } from '../entities/Application';
import { CheckApplicationAction } from './CheckApplicationAction';
import { CreateApplicationAction } from './CreateApplicationAction';
import { RevokeApplicationAction } from './RevokeApplicationAction';

chai.use(chaiAsPromised);
const { expect } = chai;

let app: Application;
let checkAction;
let createAction;
let revokeAction;
const operatorId = '5d237152497b55cdae5b1412';

describe('CreateApplicationAction', () => {
  before(() => {
    const repo = new MockApplicationRepository();
    checkAction = new CheckApplicationAction(repo);
    createAction = new CreateApplicationAction(repo);
    revokeAction = new RevokeApplicationAction(repo);
  });

  it('creates an application', async () => {
    app = await createAction.handle({
      operatorId,
      name: 'Test app',
    });

    expect(app).to.have.property('_id');
    expect(app).to.have.property('operator_id', operatorId);
  });

  it('checks the application', async () => {
    const exists = await checkAction.handle({
      operatorId,
      _id: app._id,
    });

    expect(exists).to.be.eq(true);
  });

  it('revokes the application', async () => {
    const revoked = await revokeAction.handle({
      operatorId,
      _id: app._id,
    });

    expect(revoked).to.have.property('_id');
    expect(revoked).to.have.property('deleted_at');
    expect(revoked.deleted_at).to.be.an.instanceof(Date);
  });
});
