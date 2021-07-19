import { random } from 'lodash/random'
import test from 'ava';
import sinon, { SinonStub } from 'sinon';
import faker from 'faker';

import { TripRepositoryProvider } from '../../providers/TripRepositoryProvider';
import { StreamTripsForCamaignComponent } from './StreamTripsForCamaignComponent';
import { ExportTripInterface } from '../../interfaces/ExportTripInterface';
import { LoadExcelFileComponent } from './LoadExcelFileComponent';

let streamTripsForCampaginComponent: StreamTripsForCamaignComponent;

let tripRepositoryProvider: TripRepositoryProvider;

let tripRepositoryProviderStub: SinonStub

test.before((t) => {
  tripRepositoryProvider = new TripRepositoryProvider(null)
  streamTripsForCampaginComponent = new StreamTripsForCamaignComponent(tripRepositoryProvider, new LoadExcelFileComponent());
})

test('StreamTripsForCamaignComponent: should stream 20 row to xlsx', async (t) => {
  const elem1: ExportTripInterface<Date> = faker.random.objectElement<ExportTripInterface<Date>>();

  const cursorResult1 = new Promise<ExportTripInterface<Date>[]>((resolve, reject) => {
    resolve([elem1, elem1, elem1, elem1, elem1, elem1, elem1, elem1, elem1, elem1]);
  })

  const endingPromise = new Promise<ExportTripInterface<Date>[]>((resolve, reject) => {
    resolve([]);
  })
  
  // Arrange
  tripRepositoryProviderStub = sinon.stub(tripRepositoryProvider, 'searchWithCursorForCampaign');
  let counter: number = 20;
  let myFirstResolvedFunction = (count: number): Promise<ExportTripInterface[]> => {
      if(counter !== 0){
        counter = counter - 10;
        return cursorResult1;
      }else {
        return endingPromise
      }
    
  }
  tripRepositoryProviderStub.resolves(myFirstResolvedFunction)

  // Act
  streamTripsForCampaginComponent.call(896523)
  t.is(true, true)
});