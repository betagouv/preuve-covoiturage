import { PostgresConnection } from '@ilos/connection-postgres';
import { describe } from 'mocha';
import { expect } from 'chai';

import { TerritoryOperatorRepositoryProvider } from './TerritoryOperatorRepositoryProvider';

const territoryIds = [2, 3];
const operatorId = 666;

describe('Territory operator repository', () => {
  let repository;
  let connection;

  before(async () => {
    connection = new PostgresConnection({
      connectionString:
        'APP_POSTGRES_URL' in process.env
          ? process.env.APP_POSTGRES_URL
          : 'postgresql://postgres:postgres@localhost:5432/pdc-local',
    });

    await connection.up();

    repository = new TerritoryOperatorRepositoryProvider(connection);
  });

  after(async () => {
    await connection.getClient().query({
      text: 'DELETE FROM territory.territory_operators WHERE operator_id = $1',
      values: [operatorId],
    });

    await connection.down();
  });

  it('should update by operator', async () => {
    const result = await repository.updateByOperator(operatorId, territoryIds);
    expect(result).to.be.undefined;
  });
  
  it('should list by operator', async () => {
    const resultFromRepository = await repository.findByOperator(operatorId);
    expect(resultFromRepository).to.be.an('array');
    expect(resultFromRepository).to.have.members(territoryIds);
  });

  it('should list by territory', async () => {
    const resultFromRepository = await repository.findByTerritory(territoryIds[0]);
    expect(resultFromRepository).to.be.an('array');
    expect(resultFromRepository).to.include(operatorId);
  });
});
