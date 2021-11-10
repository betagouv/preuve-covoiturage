/* eslint-disable max-len */
import { ConfigInterfaceResolver } from '@ilos/common';
import anyTest, { TestInterface } from 'ava';
import faker from 'faker';
import sinon, { SinonStub } from 'sinon';
import { UploadedResource } from '../interfaces/DataGouvInterface';
import { DataGouvProvider } from '../providers/DataGouvProvider';
import { ParamsInterface } from '../shared/trip/publishOpenData.contract';
import { BuildResourceDescription } from './opendata/BuildResourceDescription';
import { PublishOpenDataAction } from './PublishOpenDataAction';

interface Context {
  // Injected tokens
  dataGouvProvider: DataGouvProvider;
  buildResourceDescription: BuildResourceDescription;
  config: ConfigInterfaceResolver;

  // Injected tokens method's stubs
  dataGouvProviderUpdateStub: SinonStub;
  buildResourceDescriptionStub: SinonStub;
  dataGouvProviderUploadStub: SinonStub;

  // Constants
  DATASET_SLUG: string;

  // Tested token
  publishOpenDataAction: PublishOpenDataAction;
}

const test = anyTest as TestInterface<Partial<Context>>;

test.before((t) => {
  t.context.DATASET_SLUG = 'dataset-slugs';
});

test.beforeEach((t) => {
  t.context.dataGouvProvider = new DataGouvProvider(null);
  t.context.buildResourceDescription = new BuildResourceDescription(null);

  t.context.publishOpenDataAction = new PublishOpenDataAction(
    new (class extends ConfigInterfaceResolver {
      get(k: string, c: any) {
        return t.context.DATASET_SLUG;
      }
    })(),
    t.context.dataGouvProvider,
    t.context.buildResourceDescription,
  );

  t.context.dataGouvProviderUploadStub = sinon.stub(t.context.dataGouvProvider, 'uploadResources');
  t.context.dataGouvProviderUpdateStub = sinon.stub(t.context.dataGouvProvider, 'updateResource');
  t.context.buildResourceDescriptionStub = sinon.stub(t.context.buildResourceDescription, 'call');
});

test.afterEach((t) => {
  t.context.dataGouvProviderUpdateStub.restore();
  t.context.buildResourceDescriptionStub.restore();
});

test('PublishOpendataAction: should process standard opendata export', async (t) => {
  // Arrange
  const params: ParamsInterface = {
    filepath: '/tmp/2021-08.csv',
    tripSearchQueryParam: { status: 'ok', date: { start: new Date(), end: new Date() } },
    excludedTerritories: [{ start_territory_id: 1, end_territory_id: 3, aggregated_trips_journeys: ['trip1'] }],
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
  t.context.dataGouvProviderUploadStub.resolves(datasetResource);
  t.context.buildResourceDescriptionStub.resolves(description);

  // Act
  await t.context.publishOpenDataAction.handle(params, null);

  // Assert
  sinon.assert.calledOnceWithExactly(
    t.context.buildResourceDescriptionStub,
    params.tripSearchQueryParam,
    params.excludedTerritories,
  );
  sinon.assert.calledOnceWithExactly(t.context.dataGouvProviderUploadStub, t.context.DATASET_SLUG, params.filepath);
  sinon.assert.calledOnceWithExactly(t.context.dataGouvProviderUpdateStub, t.context.DATASET_SLUG, {
    ...datasetResource,
    description,
  });
  sinon.assert.callOrder(
    t.context.buildResourceDescriptionStub,
    t.context.dataGouvProviderUploadStub,
    t.context.dataGouvProviderUpdateStub,
  );
  t.pass();
});
