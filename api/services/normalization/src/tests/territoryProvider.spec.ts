import { expect } from 'chai';
import { describe } from 'mocha';
import { PostgresConnection } from '@ilos/connection-postgres';

import { TerritoryProvider } from '../providers/TerritoryProvider';

/**
 * Requires the 'common.insee' and 'territory.insee' tables
 * to be seeded with geographic data and the list of INSEE codes
 */
describe('Normalization Service : Territory provider', () => {
  let connection: PostgresConnection;
  let p: TerritoryProvider;

  before(async () => {
    connection = new PostgresConnection({ connectionString: process.env.APP_POSTGRES_URL });
    await connection.up();
    p = new TerritoryProvider(connection);
  });

  it('INSEE: Paris (whole)', async () => expect(await p.findByInsee('75056')).to.eq(239)); // IDFM
  it('INSEE: Paris 13', async () => expect(await p.findByInsee('75113')).to.eq(239)); // IDFM
  it('INSEE: Créteil', async () => expect(await p.findByInsee('94028')).to.eq(239)); // IDFM
  it('INSEE: Dourdan', async () => expect(await p.findByInsee('91200')).to.eq(239)); // IDFM

  it('INSEE: Saint-Pierre-de-Mézoargues', async () => expect(await p.findByInsee('13061')).to.eq(21)); // Arles, Crau...
  it('INSEE: Fontenai-les-Louvets', async () => expect(await p.findByInsee('61172')).to.eq(9)); // Alençon

  it('Point: Paris 13', async () => expect(await p.findByPoint({ lon: 2.35763, lat: 48.825556 })).to.eq(239)); // IDFM
  it('Point: Créteil', async () => expect(await p.findByPoint({ lon: 2.45291, lat: 48.782445 })).to.eq(239)); // IDFM
  it('Point: Dourdan', async () => expect(await p.findByPoint({ lon: 1.997318, lat: 48.543592 })).to.eq(239)); // IDFM

  it('Point: Saint-Pierre-de-Mézoargues', async () =>
    expect(await p.findByPoint({ lon: 4.658437, lat: 43.860243 })).to.eq(21)); // Arles, Crau...
  it('Point: Fontenai-les-Louvets', async () =>
    expect(await p.findByPoint({ lon: 0.007731, lat: 48.527366 })).to.eq(9)); // Alençon

  // it('finds a region by INSEE');
  // it('finds a foreign country by INSEE');
});
