/* eslint-disable max-len */
import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { Dataset } from '../../interfaces/index.ts';
import { DataGouvProvider } from '../../providers/DataGouvProvider.ts';
import { GetRessourceIdIfExists } from './GetRessourceIdIfExists.ts';

interface Context {
  // Injected tokens
  dataGouvProvider: DataGouvProvider;
  // Injected tokens method's stubs
  dataGouvProviderStub: SinonStub;
  // Tested token
  getRessourceIdIfExists: GetRessourceIdIfExists;
  // Constants
  dataset: Partial<Dataset>;
  DATASET_SLUG: string;
  EXISTING_RESOURCE_ID: string;
}

const test = anyTest as TestFn<Partial<Context>>;

beforeAll((t) => {
  t.context.EXISTING_RESOURCE_ID = '83d3b230-37da-46e0-8ec7-2faee41b5904';
  t.context.dataset = {
    resources: [
      {
        id: t.context.EXISTING_RESOURCE_ID,
        title: '2021-11.csv',
        filetype: 'file',
        format: 'csv',
        type: 'main',
        url: 'https://demo-satic.data.gouv.fr/resources/slug/2021-11.csv',
      },
    ],
  };
  t.context.DATASET_SLUG = 'dataset-slugs';
});

beforeEach((t) => {
  t.context.dataGouvProvider = new DataGouvProvider(null);
  t.context.getRessourceIdIfExists = new GetRessourceIdIfExists(t.context.dataGouvProvider);
  t.context.dataGouvProviderStub = sinon.stub(t.context.dataGouvProvider, 'getDataset');
});

afterEach((t) => {});

it('GetRessourceIdIfExists: should retrieve resource id if matched resource name', async (t) => {
  // Arrange
  t.context.dataGouvProviderStub.resolves(t.context.dataset);

  // Act
  const resourceId: string = await t.context.getRessourceIdIfExists.call(t.context.DATASET_SLUG, '/tmp/2021-11.csv');

  // Assert
  sinon.assert.called(t.context.dataGouvProviderStub);
  assertObjectMatch(resourceId, t.context.EXISTING_RESOURCE_ID);
});

it('GetRessourceIdIfExists: should return undefined if no matched resource name', async (t) => {
  // Arrange
  t.context.dataGouvProviderStub.resolves(t.context.dataset);

  // Act
  const resourceId: string = await t.context.getRessourceIdIfExists.call(t.context.DATASET_SLUG, '/tmp/2021-12.csv');

  // Assert
  sinon.assert.called(t.context.dataGouvProviderStub);
  assertObjectMatch(resourceId, undefined);
});
