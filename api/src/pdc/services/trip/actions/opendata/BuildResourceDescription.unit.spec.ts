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
import { TerritoryTripsInterface } from "@/shared/trip/common/interfaces/TerritoryTripsInterface.ts";
import { TripSearchInterface } from "@/shared/trip/common/interfaces/TripSearchInterface.ts";
import { TripRepositoryProvider } from "../../providers/TripRepositoryProvider.ts";
import { BuildResourceDescription } from "./BuildResourceDescription.ts";

describe("Build Resource Description", () => {
  let tripRepositoryProvider: TripRepositoryProvider;
  let tripRepositoryProviderStub: sinon.SinonStub;
  let happenMarkdownDescription: BuildResourceDescription;
  let tripSearchQueryParams: TripSearchInterface;
  let excludedTerritories: TerritoryTripsInterface[];

  beforeAll(() => {
    tripSearchQueryParams = {
      date: {
        start: new Date("2021-09-01"),
        end: new Date("2021-09-30"),
      },
      excluded_start_geo_code: ["589", "785", "5", "8"],
      excluded_end_geo_code: ["8888", "77", "5", "8"],
    };
    excludedTerritories = [
      {
        end_geo_code: "589",
        aggregated_trips_journeys: ["trip1", "trip2"],
      },
      {
        end_geo_code: "785",
        aggregated_trips_journeys: ["trip3", "trip4"],
      },
      {
        end_geo_code: "5",
        aggregated_trips_journeys: ["trip5"],
      },
      {
        end_geo_code: "8",
        aggregated_trips_journeys: ["trip6"],
      },
      {
        start_geo_code: "8888",
        aggregated_trips_journeys: ["trip6"],
      },
      {
        start_geo_code: "77",
        aggregated_trips_journeys: ["trip5"],
      },
      {
        start_geo_code: "5",
        aggregated_trips_journeys: ["trip7"],
      },
      {
        start_geo_code: "8",
        aggregated_trips_journeys: ["trip8", "trip9"],
      },
    ];
  });

  beforeEach(() => {
    tripRepositoryProvider = new TripRepositoryProvider(null as any);
    happenMarkdownDescription = new BuildResourceDescription(
      tripRepositoryProvider,
    );
    tripRepositoryProviderStub = sinon.stub(
      tripRepositoryProvider,
      "searchCount",
    );
  });

  afterEach(() => {});

  it("BuildResourceDescription: should happen description to existing one", async () => {
    // Arrange
    tripRepositoryProviderStub.onCall(0).resolves({ count: "21" });
    tripRepositoryProviderStub.onCall(1).resolves({ count: "30" });

    // Act
    const description: string = await happenMarkdownDescription.call(
      tripSearchQueryParams,
      excludedTerritories,
    );

    // Assert
    const expected_happened_description =
      "# Spécificités jeu de données septembre 2021\nLes données concernent également les trajets dont le point de départ OU d'arrivée est situé en dehors du territoire français.\n\n* Nombre trajets collectés et validés par le registre de preuve de covoiturage **30**\n* Nombre de trajets exposés dans le jeu de données : **21**\n* Nombre de trajets supprimés du jeu de données : **9 = 5 + 6 - 2**\n    * Nombre de trajets dont l’occurrence du code INSEE de départ est < 6 : **5**\n    * Nombre de trajets dont l’occurrence du code INSEE d'arrivée est < 6 : **6**\n    * Nombre de trajets dont l’occurrence du code INSEE de départ ET d'arrivée est < 6 : **2**";
    assertEquals(description, expected_happened_description);
    sinon.assert.calledWithMatch(
      tripRepositoryProviderStub.firstCall,
      tripSearchQueryParams,
    );
    const openDataQueryParamCopy: TripSearchInterface = {
      ...tripSearchQueryParams,
    };
    delete openDataQueryParamCopy.excluded_end_geo_code;
    delete openDataQueryParamCopy.excluded_start_geo_code;
    sinon.assert.calledWithMatch(
      tripRepositoryProviderStub.secondCall,
      openDataQueryParamCopy,
    );
  });
});
