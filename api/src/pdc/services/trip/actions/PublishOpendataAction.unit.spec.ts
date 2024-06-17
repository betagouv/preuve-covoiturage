/* eslint-disable max-len */
import { faker } from "@/deps.ts";
import {
  afterEach,
  assert,
  beforeAll,
  beforeEach,
  describe,
  it,
  sinon,
} from "@/dev_deps.ts";
import { ConfigInterfaceResolver } from "@/ilos/common/index.ts";
import { ParamsInterface } from "@/shared/trip/publishOpenData.contract.ts";
import { UploadedResource } from "../interfaces/DataGouvInterface.ts";
import { DataGouvProvider } from "../providers/DataGouvProvider.ts";
import { PublishOpenDataAction } from "./PublishOpenDataAction.ts";
import { BuildResourceDescription } from "./opendata/BuildResourceDescription.ts";
import { GetRessourceIdIfExists } from "./opendata/GetRessourceIdIfExists.ts";

describe("publish open data", () => {
  let dataGouvProvider: DataGouvProvider;
  let buildResourceDescription: BuildResourceDescription;
  let config: ConfigInterfaceResolver;
  let getRessourceIdIfExists: GetRessourceIdIfExists;
  let dataGouvProviderUpdateStub: sinon.SinonStub;
  let buildResourceDescriptionStub: sinon.SinonStub;
  let dataGouvProviderUploadDatasetResourceStub: sinon.SinonStub;
  let dataGouvProviderUpdateDatasetResourceStub: sinon.SinonStub;
  let getRessourceIdIfExistsStub: sinon.SinonStub;
  let DATASET_SLUG: string;
  let EXISTING_RESOURCE_ID: string;
  let publishOpenDataAction: PublishOpenDataAction;
  beforeAll(() => {
    EXISTING_RESOURCE_ID = "83d3b230-37da-46e0-8ec7-2faee41b5904";
    DATASET_SLUG = "dataset-slugs";
  });

  beforeEach(() => {
    dataGouvProvider = new DataGouvProvider(null as any);
    buildResourceDescription = new BuildResourceDescription(null as any);
    getRessourceIdIfExists = new GetRessourceIdIfExists(null as any);

    publishOpenDataAction = new PublishOpenDataAction(
      new (class extends ConfigInterfaceResolver {
        get(k: string, c: any): any {
          return DATASET_SLUG;
        }
      })() as any,
      dataGouvProvider,
      buildResourceDescription,
      getRessourceIdIfExists,
    );

    getRessourceIdIfExistsStub = sinon.stub(
      getRessourceIdIfExists,
      "call",
    );
    dataGouvProviderUploadDatasetResourceStub = sinon.stub(
      dataGouvProvider,
      "uploadDatasetResource",
    );
    dataGouvProviderUpdateDatasetResourceStub = sinon.stub(
      dataGouvProvider,
      "updateDatasetResource",
    );
    dataGouvProviderUpdateStub = sinon.stub(
      dataGouvProvider,
      "updateResource",
    );
    buildResourceDescriptionStub = sinon.stub(
      buildResourceDescription,
      "call",
    );
  });

  afterEach(() => {
    dataGouvProviderUpdateStub.restore();
    buildResourceDescriptionStub.restore();
  });

  it("PublishOpendataAction: should upload new opendata resource", async () => {
    // Arrange
    const params: ParamsInterface = {
      filepath: "/tmp/2021-08.csv",
      tripSearchQueryParam: {
        status: "ok",
        date: { start: new Date(), end: new Date() },
      },
      excludedTerritories: [{
        start_geo_code: "1",
        end_geo_code: "3",
        aggregated_trips_journeys: ["trip1"],
      }],
    };
    const datasetResource: UploadedResource = {
      success: true,
      type: "main",
      filetype: "file",
      format: "utf8",
      url: faker.internet.url(),
      title: "My resource",
    };
    const description: string = faker.lorem.words(600);
    dataGouvProviderUploadDatasetResourceStub.resolves(
      datasetResource,
    );
    buildResourceDescriptionStub.resolves(description);
    getRessourceIdIfExistsStub.resolves(undefined);

    // Act
    await publishOpenDataAction.handle(params, null as any);

    // Assert
    sinon.assert.calledOnceWithExactly(
      buildResourceDescriptionStub,
      params.tripSearchQueryParam,
      params.excludedTerritories,
    );
    sinon.assert.calledOnceWithExactly(
      dataGouvProviderUploadDatasetResourceStub,
      DATASET_SLUG,
      params.filepath,
    );
    sinon.assert.notCalled(dataGouvProviderUpdateDatasetResourceStub);
    sinon.assert.calledOnceWithExactly(
      dataGouvProviderUpdateStub,
      DATASET_SLUG,
      {
        ...datasetResource,
        description,
      },
    );
    sinon.assert.callOrder(
      buildResourceDescriptionStub,
      dataGouvProviderUploadDatasetResourceStub,
      dataGouvProviderUpdateStub,
    );
    sinon.assert.calledOnceWithExactly(
      getRessourceIdIfExistsStub,
      DATASET_SLUG,
      params.filepath,
    );
    assert(true);
  });

  it("PublishOpendataAction: should update existing opendata resource", async () => {
    // Arrange
    const params: ParamsInterface = {
      filepath: "/tmp/2021-09.csv",
      tripSearchQueryParam: {
        status: "ok",
        date: { start: new Date(), end: new Date() },
      },
      excludedTerritories: [{
        start_geo_code: "1",
        end_geo_code: "3",
        aggregated_trips_journeys: ["trip1"],
      }],
    };
    const datasetResource: UploadedResource = {
      success: true,
      type: "main",
      filetype: "file",
      format: "utf8",
      url: faker.internet.url(),
      title: "My resource",
    };
    const description: string = faker.lorem.words(600);
    dataGouvProviderUpdateDatasetResourceStub.resolves(
      datasetResource,
    );
    buildResourceDescriptionStub.resolves(description);
    getRessourceIdIfExistsStub.resolves(
      EXISTING_RESOURCE_ID,
    );

    // Act
    await publishOpenDataAction.handle(params, null as any);

    // Assert
    sinon.assert.calledOnceWithExactly(
      buildResourceDescriptionStub,
      params.tripSearchQueryParam,
      params.excludedTerritories,
    );
    sinon.assert.notCalled(dataGouvProviderUploadDatasetResourceStub);
    sinon.assert.calledOnceWithExactly(
      dataGouvProviderUpdateDatasetResourceStub,
      DATASET_SLUG,
      params.filepath,
      EXISTING_RESOURCE_ID,
    );
    sinon.assert.calledOnceWithExactly(
      dataGouvProviderUpdateStub,
      DATASET_SLUG,
      {
        ...datasetResource,
        description,
      },
    );
    sinon.assert.callOrder(
      buildResourceDescriptionStub,
      dataGouvProviderUpdateDatasetResourceStub,
      dataGouvProviderUpdateStub,
    );
    sinon.assert.calledOnceWithExactly(
      getRessourceIdIfExistsStub,
      DATASET_SLUG,
      params.filepath,
    );
    assert(true);
  });
});
