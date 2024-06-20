/* eslint-disable max-len */
import {
  afterEach,
  assertEquals,
  beforeAll,
  beforeEach,
  describe,
  it,
  sinon,
} from "@/dev_deps.ts";
import { Dataset } from "../../interfaces/index.ts";
import { DataGouvProvider } from "../../providers/DataGouvProvider.ts";
import { GetRessourceIdIfExists } from "./GetRessourceIdIfExists.ts";

describe("Get Resource definition", () => {
  let dataGouvProvider: DataGouvProvider;
  let dataGouvProviderStub: sinon.SinonStub;
  let getRessourceIdIfExists: GetRessourceIdIfExists;
  let dataset: Partial<Dataset>;
  let DATASET_SLUG: string;
  let EXISTING_RESOURCE_ID: string;

  beforeAll(() => {
    EXISTING_RESOURCE_ID = "83d3b230-37da-46e0-8ec7-2faee41b5904";
    dataset = {
      resources: [
        {
          id: EXISTING_RESOURCE_ID,
          title: "2021-11.csv",
          filetype: "file",
          format: "csv",
          type: "main",
          url: "https://demo-satic.data.gouv.fr/resources/slug/2021-11.csv",
        },
      ],
    };
    DATASET_SLUG = "dataset-slugs";
  });

  beforeEach(() => {
    dataGouvProvider = new DataGouvProvider(null as any);
    getRessourceIdIfExists = new GetRessourceIdIfExists(
      dataGouvProvider,
    );
    dataGouvProviderStub = sinon.stub(
      dataGouvProvider,
      "getDataset",
    );
  });

  afterEach(() => {});

  it("GetRessourceIdIfExists: should retrieve resource id if matched resource name", async () => {
    // Arrange
    dataGouvProviderStub.resolves(dataset);

    // Act
    const resourceId: string = await getRessourceIdIfExists.call(
      DATASET_SLUG,
      "/tmp/2021-11.csv",
    );

    // Assert
    sinon.assert.called(dataGouvProviderStub);
    assertEquals(resourceId, EXISTING_RESOURCE_ID);
  });

  it("GetRessourceIdIfExists: should return undefined if no matched resource name", async () => {
    // Arrange
    dataGouvProviderStub.resolves(dataset);

    // Act
    const resourceId: string = await getRessourceIdIfExists.call(
      DATASET_SLUG,
      "/tmp/2021-12.csv",
    );

    // Assert
    sinon.assert.called(dataGouvProviderStub);
    assertEquals(resourceId, undefined);
  });
});
