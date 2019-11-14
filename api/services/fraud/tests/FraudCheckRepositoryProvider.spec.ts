import { describe } from 'mocha';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { PostgresConnection } from '@ilos/connection-postgres';

import { FraudCheckRepositoryProvider } from '../src/providers/FraudCheckRepositoryProvider';

chai.use(chaiAsPromised);
const { expect } = chai;

const find = [
  '_id',
  'status',
  'meta',
  'karma',
];

describe('Fraudcheck repository', async () => {
  let repository: FraudCheckRepositoryProvider;
  let connection: PostgresConnection;

  let acquisitionId = '0';
  let id: number;
  before(async () => {
    connection = new PostgresConnection({
      connectionString:
        'APP_POSTGRES_URL' in process.env
          ? process.env.APP_POSTGRES_URL
          : 'postgresql://postgres:postgres@localhost:5432/pdc-local',
    });

    await connection.up();

    repository = new FraudCheckRepositoryProvider(connection);
  });

  after(async () => {
    if (acquisitionId) {
      await connection.getClient().query({
        text: `DELETE FROM ${repository.table} WHERE acquisition_id = $1`,
        values: [acquisitionId],
      });
    }

    await connection.down();
  });

  it('should create a fraudcheck entry', async () => {
    const data = await repository.findOrCreateFraudCheck(acquisitionId, 'mymethod');
    id = data._id;
    expect(data).to.have.all.keys(find);
    expect(data.status).to.eq('pending');
    expect(data.karma).to.eq(0);
    expect(data.meta).to.deep.eq({});
  });

  it('should not create a fraudcheck entry if exists', async () => {
    const data = await repository.findOrCreateFraudCheck(acquisitionId, 'mymethod');
    expect(data).to.have.all.keys(find);
    expect(data._id).to.eq(id);
    expect(data.status).to.eq('pending');
    expect(data.karma).to.eq(0);
    expect(data.meta).to.deep.eq({});
  });

  it('should update a fraudcheck entry if exists', async () => {
    const actualData = await repository.findOrCreateFraudCheck(acquisitionId, 'mymethod');
    actualData.status = 'done'
    actualData.karma = 100;
    actualData.meta = {
      it: 'works',
    };

    await repository.updateFraudCheck(actualData);

    const updatedData = await repository.findOrCreateFraudCheck(acquisitionId, 'mymethod');
    expect(updatedData).to.have.all.keys(find);
    expect(updatedData).to.deep.eq(actualData);
  });

  it('should throw an error if trying to update a non existing fraud entry', async () => {
    await expect(
      repository.updateFraudCheck({
        _id: 12345689,
        karma: 0,
        meta: {},
        status: 'done',
      })
    ).to.eventually.rejectedWith();
  });
});
