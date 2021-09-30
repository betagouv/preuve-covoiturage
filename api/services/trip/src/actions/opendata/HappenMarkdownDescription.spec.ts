/* eslint-disable max-len */
import anyTest, { TestInterface } from 'ava';
import { TripRepositoryProvider } from '../../providers/TripRepositoryProvider';
import { OpenDataTripSearchInterface } from '../../shared/trip/common/interfaces/TripSearchInterface';
import { HappenMarkdownDescription } from './HappenMarkdownDescription';
import sinon, { SinonStub } from 'sinon';

interface Context {
  // Injected tokens
  tripRepositoryProvider: TripRepositoryProvider;
  // Injected tokens method's stubs
  tripRepositoryProviderStub: SinonStub;
  // Tested token
  happenMarkdownDescription: HappenMarkdownDescription;
  // Constants
}

const test = anyTest as TestInterface<Partial<Context>>;

test.beforeEach((t) => {
  t.context.tripRepositoryProvider = new TripRepositoryProvider(null);
  t.context.happenMarkdownDescription = new HappenMarkdownDescription(t.context.tripRepositoryProvider);
  t.context.tripRepositoryProviderStub = sinon.stub(t.context.tripRepositoryProvider, 'searchCount');
});

test.afterEach((t) => {});

test('HappenMarkdownDescription: should happen description to existing one', async (t) => {
  // Arrange
  const existingDescription =
    "# Spécificités jeu de données janvier 2021\nLes données concernent également les trajets dont le point de départ OU d'arrivée est situé en dehors du territoire français.\n\n* Nombre trajets collectés et validés par le registre de preuve de covoiturage **96 012**\n* Nombre de trajets exposés dans le jeu de données : **90 443**\n* Nombre de trajets supprimés du jeu de données : **5 569 = 3 103 + 2 998 - 532**\n    * Nombre d’occurrences du code INSEE de départ est < 6 : **3 103**\n    * Nombre d’occurrences du code INSEE d'arrivée est < 6 : **2 998**\n    * Nombre d’occurrences du code INSEE de départ ET d'arrivée est < 6 : **532**";
  t.context.tripRepositoryProviderStub.onCall(0).resolves({ count: '20' });
  t.context.tripRepositoryProviderStub.onCall(1).resolves({ count: '26' });

  const openDataQueryParam: OpenDataTripSearchInterface = {
    date: {
      start: new Date('2021-09-01'),
      end: new Date('2021-09-30'),
    },
    excluded_start_territory_id: [589, 785, 5, 8],
    excluded_end_territory_id: [8888, 77, 5, 8],
  };

  // Act
  const description: string = await t.context.happenMarkdownDescription.call(openDataQueryParam, existingDescription);

  // Assert
  const expected_happened_description =
    "\n\n# Spécificités jeu de données septembre 2021\nLes données concernent également les trajets dont le point de départ OU d'arrivée est situé en dehors du territoire français.\n\n* Nombre trajets collectés et validés par le registre de preuve de covoiturage **26**\n* Nombre de trajets exposés dans le jeu de données : **20**\n* Nombre de trajets supprimés du jeu de données : **6 = 4 + 4 - 2**\n    * Nombre d’occurrences du code INSEE de départ est < 6 : **4**\n    * Nombre d’occurrences du code INSEE d'arrivée est < 6 : **4**\n    * Nombre d’occurrences du code INSEE de départ ET d'arrivée est < 6 : **2**";
  t.deepEqual(description, `${existingDescription}${expected_happened_description}`);
  sinon.assert.calledWithMatch(t.context.tripRepositoryProviderStub.firstCall, openDataQueryParam);
  const openDataQueryParamCopy: OpenDataTripSearchInterface = {
    ...openDataQueryParam,
  };
  delete openDataQueryParamCopy.excluded_end_territory_id;
  delete openDataQueryParamCopy.excluded_start_territory_id;
  sinon.assert.calledWithMatch(t.context.tripRepositoryProviderStub.secondCall, openDataQueryParamCopy);
});
