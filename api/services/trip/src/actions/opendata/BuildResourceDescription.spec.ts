/* eslint-disable max-len */
import anyTest, { TestFn } from 'ava';
import sinon, { SinonStub } from 'sinon';
import { TripRepositoryProvider } from '../../providers/TripRepositoryProvider';
import { TerritoryTripsInterface } from '../../shared/trip/common/interfaces/TerritoryTripsInterface';
import { TripSearchInterface } from '../../shared/trip/common/interfaces/TripSearchInterface';
import { BuildResourceDescription } from './BuildResourceDescription';

interface Context {
  // Injected tokens
  tripRepositoryProvider: TripRepositoryProvider;
  // Injected tokens method's stubs
  tripRepositoryProviderStub: SinonStub;
  // Tested token
  happenMarkdownDescription: BuildResourceDescription;
  // Constants
  tripSearchQueryParams: TripSearchInterface;
  excludedTerritories: TerritoryTripsInterface[];
}

const test = anyTest as TestFn<Partial<Context>>;

test.before((t) => {
  t.context.tripSearchQueryParams = {
    date: {
      start: new Date('2021-09-01'),
      end: new Date('2021-09-30'),
    },
    excluded_start_territory_id: [589, 785, 5, 8],
    excluded_end_territory_id: [8888, 77, 5, 8],
  };
  t.context.excludedTerritories = [
    {
      end_territory_id: 589,
      aggregated_trips_journeys: ['trip1', 'trip2'],
    },
    {
      end_territory_id: 785,
      aggregated_trips_journeys: ['trip3', 'trip4'],
    },
    {
      end_territory_id: 5,
      aggregated_trips_journeys: ['trip5'],
    },
    {
      end_territory_id: 8,
      aggregated_trips_journeys: ['trip6'],
    },
    {
      start_territory_id: 8888,
      aggregated_trips_journeys: ['trip6'],
    },
    {
      start_territory_id: 77,
      aggregated_trips_journeys: ['trip5'],
    },
    {
      start_territory_id: 5,
      aggregated_trips_journeys: ['trip7'],
    },
    {
      start_territory_id: 8,
      aggregated_trips_journeys: ['trip8', 'trip9'],
    },
  ];
});

test.beforeEach((t) => {
  t.context.tripRepositoryProvider = new TripRepositoryProvider(null);
  t.context.happenMarkdownDescription = new BuildResourceDescription(t.context.tripRepositoryProvider);
  t.context.tripRepositoryProviderStub = sinon.stub(t.context.tripRepositoryProvider, 'searchCount');
});

test.afterEach((t) => {});

test('BuildResourceDescription: should happen description to existing one', async (t) => {
  // Arrange
  t.context.tripRepositoryProviderStub.onCall(0).resolves({ count: '21' });
  t.context.tripRepositoryProviderStub.onCall(1).resolves({ count: '30' });

  // Act
  const description: string = await t.context.happenMarkdownDescription.call(
    t.context.tripSearchQueryParams,
    t.context.excludedTerritories,
  );

  // Assert
  const expected_happened_description =
    "# Spécificités jeu de données septembre 2021\nLes données concernent également les trajets dont le point de départ OU d'arrivée est situé en dehors du territoire français.\n\n* Nombre trajets collectés et validés par le registre de preuve de covoiturage **30**\n* Nombre de trajets exposés dans le jeu de données : **21**\n* Nombre de trajets supprimés du jeu de données : **9 = 5 + 6 - 2**\n    * Nombre de trajets dont l’occurrence du code INSEE de départ est < 6 : **5**\n    * Nombre de trajets dont l’occurrence du code INSEE d'arrivée est < 6 : **6**\n    * Nombre de trajets dont l’occurrence du code INSEE de départ ET d'arrivée est < 6 : **2**";
  t.deepEqual(description, expected_happened_description);
  sinon.assert.calledWithMatch(t.context.tripRepositoryProviderStub.firstCall, t.context.tripSearchQueryParams);
  const openDataQueryParamCopy: TripSearchInterface = {
    ...t.context.tripSearchQueryParams,
  };
  delete openDataQueryParamCopy.excluded_end_territory_id;
  delete openDataQueryParamCopy.excluded_start_territory_id;
  sinon.assert.calledWithMatch(t.context.tripRepositoryProviderStub.secondCall, openDataQueryParamCopy);
});
