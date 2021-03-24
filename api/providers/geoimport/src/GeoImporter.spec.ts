import path from 'path';
import anyTest, { TestInterface } from 'ava';
import nock from 'nock';

import { GeoImporter } from '.';

import { GeoImporterError, NotFoundGeoImporterError, ServerUnavailableGeoImporterError } from './GeoImporterError';
import { gzipSync } from 'zlib';

interface TestContext {
  provider: GeoImporter;
}

const test = anyTest as TestInterface<TestContext>;

test.before(async (t) => {
  t.context.provider = new GeoImporter();
});

test.beforeEach(() => {
  nock.cleanAll();
});

test('GeoImporter: should list regions', async (t) => {
  const scope = nock(t.context.provider.baseApiEndpoint)
    .get('/regions')
    .reply(200, [
      { nom: 'Guadeloupe', code: '01' },
      { nom: 'Martinique', code: '02' },
      { nom: 'Guyane', code: '03' },
    ]);
  const result = await t.context.provider.listRegions();
  t.is(result.length, 3);
  const resultKeys = result.map((r) => Object.keys(r));
  t.is(resultKeys.filter((rk) => rk.length !== 2).length, 0);
  t.deepEqual([...new Set<string>(resultKeys.reduce((a, i) => [...a, ...i], []))], ['name', 'code']);
  t.true(scope.isDone());
});

test('GeoImporter: should raise error on region if server unavailable', async (t) => {
  const scope = nock(t.context.provider.baseApiEndpoint).get('/regions').reply(500, 'Server is dead');
  await t.throwsAsync(async () => t.context.provider.listRegions(), {
    instanceOf: ServerUnavailableGeoImporterError,
    message: 'Request failed with status code 500',
  });
  t.true(scope.isDone());
});

test('GeoImporter: should raise error on region if json not processable', async (t) => {
  const scope = nock(t.context.provider.baseApiEndpoint).get('/regions').reply(200, {});
  await t.throwsAsync(async () => t.context.provider.listRegions());
  t.true(scope.isDone());
});

test('GeoImporter: should list districts', async (t) => {
  const scope = nock(t.context.provider.baseApiEndpoint)
    .get('/regions/28/departements')
    .reply(200, [
      { nom: 'Calvados', code: '14', codeRegion: '28' },
      { nom: 'Eure', code: '27', codeRegion: '28' },
      { nom: 'Manche', code: '50', codeRegion: '28' },
    ]);
  const result = await t.context.provider.listDistrictsByRegionCode('28');
  t.is(result.length, 3);
  const resultKeys = result.map((r) => Object.keys(r));
  t.is(resultKeys.filter((rk) => rk.length !== 2).length, 0);
  t.deepEqual([...new Set<string>(resultKeys.reduce((a, i) => [...a, ...i], []))], ['name', 'code']);
  t.true(scope.isDone());
});

test('GeoImporter: should raise error on district list if region doesnt exists', async (t) => {
  const scope = nock(t.context.provider.baseApiEndpoint).get('/regions/nope/departements').reply(404);
  await t.throwsAsync(async () => t.context.provider.listDistrictsByRegionCode('nope'), {
    instanceOf: NotFoundGeoImporterError,
    message: 'Region "nope" is not found',
  });
  t.true(scope.isDone());
});

test('GeoImporter: should raise error  on district list if server unavailable', async (t) => {
  const scope = nock(t.context.provider.baseApiEndpoint).get('/regions/28/departements').reply(500, 'Server is dead');
  await t.throwsAsync(async () => t.context.provider.listDistrictsByRegionCode('28'), {
    instanceOf: ServerUnavailableGeoImporterError,
    message: 'Request failed with status code 500',
  });
  t.true(scope.isDone());
});

test('GeoImporter: should raise error on discrict list if json not processable', async (t) => {
  const scope = nock(t.context.provider.baseApiEndpoint).get('/regions/28/departements').reply(200, {});
  await t.throwsAsync(async () => t.context.provider.listDistrictsByRegionCode('28'));
  t.true(scope.isDone());
});

test('GeoImporter: should list city', async (t) => {
  const scope = nock(t.context.provider.baseApiEndpoint)
    .get('/departements/91/communes')
    .query({ fields: 'nom,code,surface,population' })
    .reply(200, [
      { nom: 'Villiers-le-Bâcle', code: '91679', surface: 606.88, population: 1249 },
      { nom: 'Yerres', code: '91691', surface: 996.54, population: 28820 },
      { nom: 'Les Ulis', code: '91692', surface: 545.69, population: 24868 },
    ]);
  const result = await t.context.provider.listCitiesByDistrictCode('91');
  t.log(result);
  t.is(result.length, 3);
  const resultKeys = result.map((r) => Object.keys(r));
  t.is(resultKeys.filter((rk) => rk.length !== 4).length, 0);
  t.deepEqual(
    [...new Set<string>(resultKeys.reduce((a, i) => [...a, ...i], []))],
    ['name', 'code', 'population', 'surface'],
  );
  t.true(scope.isDone());
});

test('GeoImporter: should raise error on city list if district doesnt exists', async (t) => {
  const scope = nock(t.context.provider.baseApiEndpoint)
    .get('/departements/nope/communes')
    .query({ fields: 'nom,code,surface,population' })
    .reply(404);
  await t.throwsAsync(async () => t.context.provider.listCitiesByDistrictCode('nope'), {
    instanceOf: NotFoundGeoImporterError,
    message: 'District "nope" is not found',
  });
  t.true(scope.isDone());
});

test('GeoImporter: should raise error  on city list if server unavailable', async (t) => {
  const scope = nock(t.context.provider.baseApiEndpoint)
    .get('/departements/91/communes')
    .query({ fields: 'nom,code,surface,population' })
    .reply(500, 'Server is dead');
  await t.throwsAsync(async () => t.context.provider.listCitiesByDistrictCode('91'), {
    instanceOf: ServerUnavailableGeoImporterError,
    message: 'Request failed with status code 500',
  });
  t.true(scope.isDone());
});

test('GeoImporter: should raise error on city list if json not processable', async (t) => {
  const scope = nock(t.context.provider.baseApiEndpoint)
    .get('/departements/91/communes')
    .query({ fields: 'nom,code,surface,population' })
    .reply(200, {});
  await t.throwsAsync(async () => t.context.provider.listCitiesByDistrictCode('91'));
  t.true(scope.isDone());
});

test('GeoImporter: should process file', async (t) => {
  const scope = nock(t.context.provider.baseDataSetEndpoint)
    .get('/communes-5m.geojson.gz')
    .replyWithFile(200, path.join(__dirname, 'GeoImporter.mock.gz'), {
      'Content-Type': 'application/octet-stream',
    });

  const lines = [];
  await t.context.provider.process([
    async (data) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      lines.push(data);
      return data;
    },
  ]);

  t.true(scope.isDone());
  t.is(lines.length, 18);
});

test('GeoImporter: should throw error when processing file if file not found', async (t) => {
  const scope = nock(t.context.provider.baseDataSetEndpoint).get('/communes-5m.geojson.gz').reply(404);

  await t.throwsAsync(
    async () => t.context.provider.process(),
    { instanceOf: NotFoundGeoImporterError },
    'File "" not found',
  );
  t.true(scope.isDone());
});

test('GeoImporter: should throw error when processing file if server is dead', async (t) => {
  const scope = nock(t.context.provider.baseDataSetEndpoint)
    .get('/communes-5m.geojson.gz')
    .reply(500, 'Server is dead');

  await t.throwsAsync(async () => t.context.provider.process(), {
    instanceOf: ServerUnavailableGeoImporterError,
    message: 'Request failed with status code 500',
  });
  t.true(scope.isDone());
});

test('GeoImporter: should throw error when processing file if file is not valid json', async (t) => {
  const buf = gzipSync(Buffer.from('notjson', 'utf-8'));
  const scope = nock(t.context.provider.baseDataSetEndpoint).get('/communes-5m.geojson.gz').reply(200, buf, {
    'Content-Type': 'application/octet-stream',
  });

  await t.throwsAsync(async () => t.context.provider.process(), {
    instanceOf: GeoImporterError,
    message: 'Parser cannot parse input: expected a value',
  });
  t.true(scope.isDone());
});

test('GeoImporter: should throw error when processing file if something goes wrong when processing', async (t) => {
  const scope = nock(t.context.provider.baseDataSetEndpoint)
    .get('/communes-5m.geojson.gz')
    .replyWithFile(200, path.join(__dirname, 'GeoImporter.mock.gz'), {
      'Content-Type': 'application/octet-stream',
    });

  await t.throwsAsync(
    async () =>
      t.context.provider.process([
        async () => {
          throw new Error('Something goes wrong');
        },
      ]),
    { instanceOf: GeoImporterError, message: 'Something goes wrong' },
  );
  t.true(scope.isDone());
});
