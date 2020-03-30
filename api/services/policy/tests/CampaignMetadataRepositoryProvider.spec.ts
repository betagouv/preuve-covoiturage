import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { PostgresConnection } from '@ilos/connection-postgres';

import { CampaignMetadataRepositoryProvider } from '../src/engine/CampaignMetadataRepositoryProvider';
import { MetadataWrapper } from '../src/engine/MetadataWrapper';

chai.use(chaiAsPromised);
const { expect } = chai;
let repository: CampaignMetadataRepositoryProvider;
let connection: PostgresConnection;
describe('Campaign metadata repository', () => {
  const policyId = 0;

  before(async () => {
    connection = new PostgresConnection({
      connectionString:
        'APP_POSTGRES_URL' in process.env
          ? process.env.APP_POSTGRES_URL
          : 'postgresql://postgres:postgres@localhost:5432/pdc-local',
    });

    await connection.up();

    repository = new CampaignMetadataRepositoryProvider(connection);
  });

  after(async () => {
    // clean db
    await connection.getClient().query({
      text: `DELETE from ${repository.table} WHERE policy_id = $1`,
      values: [policyId],
    });
    // shutdown connection
    await connection.down();
  });

  beforeEach(async () => {
    await connection.getClient().query({
      text: `DELETE from ${repository.table} WHERE policy_id = $1`,
      values: [policyId],
    });
  });

  it('should always return a metadata wrapper', async () => {
    const meta = await repository.get(policyId);
    expect(meta).to.be.instanceOf(MetadataWrapper);
    expect(meta.id).to.be.eq(policyId);
    expect(meta.keys().length).to.be.eq(0);
  });

  it('should create metadata wrapper on database', async () => {
    const meta = await repository.get(policyId);
    expect(meta).to.be.instanceOf(MetadataWrapper);
    meta.set('toto', 'tata');

    await repository.set(meta);

    const dbResult = await connection.getClient().query({
      text: `SELECT value from ${repository.table} WHERE policy_id = $1 AND key = $2`,
      values: [policyId, 'default'],
    });

    expect(dbResult.rowCount).to.be.eq(1);
    expect(dbResult.rows).to.deep.eq([
      {
        value: { toto: 'tata' },
      },
    ]);
  });
});
