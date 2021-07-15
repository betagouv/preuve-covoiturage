import { random } from 'lodash/random'
import test from 'ava';
import sinon, { SinonStub } from 'sinon';
import faker from 'faker';
;
import { TripRepositoryProvider } from '../../providers/TripRepositoryProvider';
import { StreamTripsForCamaignComponent } from './StreamTripsForCamaignComponent';
import { ExportTripInterface } from '../../interfaces/ExportTripInterface';

let streamTripsForCampaginComponent: StreamTripsForCamaignComponent;

let tripRepositoryProvider: TripRepositoryProvider;

let tripRepositoryProviderStub: SinonStub

const data: ExportTripInterface<Date>[] = []
// const data : ExportTripInterface<Date>[] = [{
//   journey_id: '',
//   trip_id,
//   journey_start_lat,
//   journey_end_lon,
//   journey_distance,
//   journey_distance_anounced,
//   journey_distance_calculated,
//   journey_duration, 
//   journey_duration_anounced,
//   journey_duration_calculated,
//   journey_end_country,
//   journey_end_datetime,
//   journey_end_department, 
//   journey_end_insee,
//   journey_end_lat,
//   journey_end_postalcode,
//   journey_end_town,
//   journey_end_towngroup, 
//   journey_start_country,
//   journey_start_datetime,
//   journey_start_department,
//   journey_start_insee,
//   journey_start_lon,
//   journey_start_postalcode,
//   journey_start_town, 
//   journey_start_towngroup,
// }]



test.before((t) => {
  tripRepositoryProvider = new TripRepositoryProvider(null)
  streamTripsForCampaginComponent = new StreamTripsForCamaignComponent(tripRepositoryProvider);
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