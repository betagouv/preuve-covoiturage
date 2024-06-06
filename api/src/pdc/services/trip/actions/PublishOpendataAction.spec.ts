/* eslint-disable max-len */
import { ConfigInterfaceResolver } from '/ilos/common/index.ts';
import anyTest, { TestFn } from 'ava';
import { faker } from '@faker-js/faker';
import sinon, { SinonStub } from 'sinon';
import { UploadedResource } from '../interfaces/DataGouvInterface.ts';
import { DataGouvProvider } from '../providers/DataGouvProvider.ts';
import { ParamsInterface } from '/shared/trip/publishOpenData.contract.ts';
import { BuildResourceDescription } from './opendata/BuildResourceDescription.ts';
import { PublishOpenDataAction } from './PublishOpenDataAction.ts';
import { GetRessourceIdIfExists } from './opendata/GetRessourceIdIfExists.ts';

interface Context {
  // Injected tokens
  dataGouvProvider: DataGouvProvider;
  buildResourceDescription: BuildResourceDescription;
  config: ConfigInterfaceResolver;
  getRessourceIdIfExists: GetRessourceIdIfExists;

  // Injected tokens method's stubs
  dataGouvProviderUpdateStub: SinonStub;
  buildResourceDescriptionStub: SinonStub;
  dataGouvProviderUploadDatasetResourceStub: SinonStub;
  dataGouvProviderUpdateDatasetResourceStub: SinonStub;
  getRessourceIdIfExistsStub: SinonStub;

  // Constants
  DATASET_SLUG: string;
  EXISTING_RESOURCE_ID: string;

  // Tested token
  publishOpenDataAction: PublishOpenDataAction;
}

const test = anyTest as TestFn<Partial<Context>>;

test.before((t) => {
  t.context.EXISTING_RESOURCE_ID = '83d3b230-37da-46e0-8ec7-2faee41b5904';
  t.context.DATASET_SLUG = 'dataset-slugs';
});

test.beforeEach((t) => {
  t.context.dataGouvProvider = new DataGouvProvider(null);
  t.context.buildResourceDescription = new BuildResourceDescription(null);
  t.context.getRessourceIdIfExists = new GetRessourceIdIfExists(null);

  t.context.publishOpenDataAction = new PublishOpenDataAction(
    new (class extends ConfigInterfaceResolver {
      get<T>(k: string, c: T): T {
        return t.context.DATASET_SLUG as T;
      }
    })(),
    t.context.dataGouvProvider,
    t.context.buildResourceDescription,
    t.context.getRessourceIdIfExists,
  );

  t.context.getRessourceIdIfExistsStub = sinon.stub(t.context.getRessourceIdIfExists, 'call');
  t.context.dataGouvProviderUploadDatasetResourceStub = sinon.stub(t.context.dataGouvProvider, 'uploadDatasetResource');
  t.context.dataGouvProviderUpdateDatasetResourceStub = sinon.stub(t.context.dataGouvProvider, 'updateDatasetResource');
  t.context.dataGouvProviderUpdateStub = sinon.stub(t.context.dataGouvProvider, 'updateResource');
  t.context.buildResourceDescriptionStub = sinon.stub(t.context.buildResourceDescription, 'call');
});

test.afterEach((t) => {
  t.context.dataGouvProviderUpdateStub.restore();
  t.context.buildResourceDescriptionStub.restore();
});

test('PublishOpendataAction: should upload new opendata resource', async (t) => {
  // Arrange
  const params: ParamsInterface = {
    filepath: '/tmp/2021-08.csv',
    tripSearchQueryParam: { status: 'ok', date: { start: new Date(), end: new Date() } },
    excludedTerritories: [{ start_geo_code: '1', end_geo_code: '3', aggregated_trips_journeys: ['trip1'] }],
  };
  const datasetResource: UploadedResource = {
    success: true,
    type: 'main',
    filetype: 'file',
    format: 'utf8',
    url: faker.internet.url(),
    title: 'My resource',
  };
  const description: string = faker.lorem.words(600);
  t.context.dataGouvProviderUploadDatasetResourceStub.resolves(datasetResource);
  t.context.buildResourceDescriptionStub.resolves(description);
  t.context.getRessourceIdIfExistsStub.resolves(undefined);

  // Act
  await t.context.publishOpenDataAction.handle(params, null);

  // Assert
  sinon.assert.calledOnceWithExactly(
    t.context.buildResourceDescriptionStub,
    params.tripSearchQueryParam,
    params.excludedTerritories,
  );
  sinon.assert.calledOnceWithExactly(
    t.context.dataGouvProviderUploadDatasetResourceStub,
    t.context.DATASET_SLUG,
    params.filepath,
  );
  sinon.assert.notCalled(t.context.dataGouvProviderUpdateDatasetResourceStub);
  sinon.assert.calledOnceWithExactly(t.context.dataGouvProviderUpdateStub, t.context.DATASET_SLUG, {
    ...datasetResource,
    description,
  });
  sinon.assert.callOrder(
    t.context.buildResourceDescriptionStub,
    t.context.dataGouvProviderUploadDatasetResourceStub,
    t.context.dataGouvProviderUpdateStub,
  );
  sinon.assert.calledOnceWithExactly(t.context.getRessourceIdIfExistsStub, t.context.DATASET_SLUG, params.filepath);
  t.pass();
});

test('PublishOpendataAction: should update existing opendata resource', async (t) => {
  // Arrange
  const params: ParamsInterface = {
    filepath: '/tmp/2021-09.csv',
    tripSearchQueryParam: { status: 'ok', date: { start: new Date(), end: new Date() } },
    excludedTerritories: [{ start_geo_code: '1', end_geo_code: '3', aggregated_trips_journeys: ['trip1'] }],
  };
  const datasetResource: UploadedResource = {
    success: true,
    type: 'main',
    filetype: 'file',
    format: 'utf8',
    url: faker.internet.url(),
    title: 'My resource',
  };
  const description: string = faker.lorem.words(600);
  t.context.dataGouvProviderUpdateDatasetResourceStub.resolves(datasetResource);
  t.context.buildResourceDescriptionStub.resolves(description);
  t.context.getRessourceIdIfExistsStub.resolves(t.context.EXISTING_RESOURCE_ID);

  // Act
  await t.context.publishOpenDataAction.handle(params, null);

  // Assert
  sinon.assert.calledOnceWithExactly(
    t.context.buildResourceDescriptionStub,
    params.tripSearchQueryParam,
    params.excludedTerritories,
  );
  sinon.assert.notCalled(t.context.dataGouvProviderUploadDatasetResourceStub);
  sinon.assert.calledOnceWithExactly(
    t.context.dataGouvProviderUpdateDatasetResourceStub,
    t.context.DATASET_SLUG,
    params.filepath,
    t.context.EXISTING_RESOURCE_ID,
  );
  sinon.assert.calledOnceWithExactly(t.context.dataGouvProviderUpdateStub, t.context.DATASET_SLUG, {
    ...datasetResource,
    description,
  });
  sinon.assert.callOrder(
    t.context.buildResourceDescriptionStub,
    t.context.dataGouvProviderUpdateDatasetResourceStub,
    t.context.dataGouvProviderUpdateStub,
  );
  sinon.assert.calledOnceWithExactly(t.context.getRessourceIdIfExistsStub, t.context.DATASET_SLUG, params.filepath);
  t.pass();
});
