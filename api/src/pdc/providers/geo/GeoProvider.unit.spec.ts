import {
  afterEach,
  assert,
  assertRejects,
  beforeAll,
  describe,
  it,
  sinon,
} from "@/dev_deps.ts";
import { NotFoundException } from "@/ilos/common/exceptions/NotFoundException.ts";
import { PartialGeoInterface } from "@/pdc/providers/geo/interfaces/index.ts";
import { GeoProvider } from "./index.ts";
import { GeoInterface } from "./interfaces/GeoInterface.ts";
import { LocalGeoProvider } from "./providers/LocalGeoProvider.ts";
import {
  EtalabAPIGeoProvider,
  EtalabBaseAdresseNationaleProvider,
} from "./providers/index.ts";

describe("geo provider", () => {
  const localGeoProvider = new LocalGeoProvider(null as any);
  const etalabApiGeoProvider = new EtalabAPIGeoProvider();
  const etalabBANProvider = new EtalabBaseAdresseNationaleProvider();
  const geoProvider = new GeoProvider(
    etalabApiGeoProvider,
    etalabBANProvider,
    localGeoProvider,
    null as any,
  );

  let localGeoProviderStub: sinon.SinonStub;

  beforeAll(() => {
  });

  afterEach(() => {
    localGeoProviderStub.restore();
  });

  it("GeoProvider: should complete insee if null", async () => {
    localGeoProviderStub = sinon.stub(localGeoProvider, "positionToInsee");
    localGeoProviderStub.resolves("65215");
    const end: PartialGeoInterface = { lat: 43.69617, lon: 7.28949 };

    // Act
    const endGeoInterfaceResult: GeoInterface = await geoProvider
      .checkAndComplete(end);

    // Assert
    assert(!!endGeoInterfaceResult.geo_code);
  });

  it("GeoProvider: should throw Error exception all 3 providers fails to find insee", async () => {
    // Arrange
    localGeoProviderStub.throws(new NotFoundException());
    sinon.stub(etalabApiGeoProvider, "positionToInsee").throws(
      new NotFoundException(),
    );
    sinon.stub(etalabBANProvider, "positionToInsee").throws(
      new NotFoundException(),
    );
    const end: PartialGeoInterface = { lat: 43.72953, lon: 7.4166 };

    // Act  // Assert
    await assertRejects(() => geoProvider.checkAndComplete(end));
  });
});
