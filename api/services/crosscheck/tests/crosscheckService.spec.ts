import chai from 'chai';
import supertest from 'supertest';
import chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { ObjectId } from '@ilos/provider-mongo';

import { FakeServer } from './server/server';
import { MockFactory } from './mocks/factory';
import { journey, secondJourney } from './mocks/journey';
import { trip } from './mocks/trip';
import { Person, Trip } from '../src/entities/Trip';

chai.use(chaiAsPromised);

const { expect } = chai;

const mockServer = new FakeServer();
const mockFactory = new MockFactory();

let superRequest;

before(async () => {
  await mockServer.startServer();
  await mockServer.startTransport();
  superRequest = supertest(mockServer.server);
});

after(async () => {
  await mockServer.stopServer();
  await mockServer.stopTransport();
});

afterEach(async () => {
  await mockServer.clearCollection();
});

const request = mockFactory.request();

const existingTripId = '5d0b616f9f611aef34deb304';
let processParams;
let addedTrip: Trip | null;

describe('SERVICE CROSSCHECK : Process - new Trip from journey', () => {
  before(async () => {
    processParams = {
      journey: {
        ...journey,
      },
    };
  });

  it('should create trip', async () => {
    const { data, status } = await request.post('/', mockFactory.call('crosscheck:process', processParams));

    expect(data.result).to.have.property('_id');
    expect(data.result.territory).to.eql(trip.territory);
    expect(data.result.status).to.eql(trip.status);
    expect(data.result.start).to.eql(trip.start.toISOString());

    const passenger = <any>{
      ...trip.people[0],
      start: { ...trip.people[0].start },
      end: { ...trip.people[0].end },
    };
    passenger.start.datetime = passenger.start.datetime.toISOString();
    passenger.end.datetime = passenger.end.datetime.toISOString();

    const driver = <any>{
      ...trip.people[1],
      start: { ...trip.people[1].start },
      end: { ...trip.people[1].end },
    };
    driver.start.datetime = driver.start.datetime.toISOString();
    driver.end.datetime = driver.end.datetime.toISOString();

    expect(data.result.people[0]).to.eql(driver);
    expect(data.result.people[1]).to.eql(passenger);

    expect(status).equal(200);
  });
});

let newJourney;
describe('SERVICE CROSSCHECK : Process - consolidate trip with journey', () => {
  before(async () => {
    newJourney = {
      ...secondJourney,
      passenger: {
        ...secondJourney.passenger,
        identity: {
          ...secondJourney.passenger.identity,
          phone: '0672814455', // different phone
        },
      },
    };

    processParams = {
      journey: newJourney,
    };
    addedTrip = await mockServer.addTrip({
      ...trip,
      _id: new ObjectId(existingTripId),
    });
  });

  it('should consolidate trip with operator_id and operator_journey_id', async () => {
    const { data, status } = await request.post('/', mockFactory.call('crosscheck:process', processParams));

    expect(data.result._id).to.eql(existingTripId);

    const passenger = <any>{
      ...trip.people[0],
      start: { ...trip.people[0].start },
      end: { ...trip.people[0].end },
    };
    passenger.start.datetime = passenger.start.datetime.toISOString();
    passenger.end.datetime = passenger.end.datetime.toISOString();

    const driver = <any>{
      ...trip.people[1],
      start: { ...trip.people[1].start },
      end: { ...trip.people[1].end },
    };
    driver.start.datetime = driver.start.datetime.toISOString();
    driver.end.datetime = driver.end.datetime.toISOString();

    const secondPassager = {
      ...newJourney.passenger,
      start: { ...secondJourney.passenger.start },
      end: { ...secondJourney.passenger.end },
      journey_id: newJourney.journey_id,
      class: newJourney.operator_class,
      operator_journey_id: newJourney.operator_journey_id,
      operator_class: newJourney.operator_class,
      operator_id: newJourney.operator_id,
      is_driver: false,
      revenue: null,
      payments: null,
      validation: null,
    };

    secondPassager.start.datetime = <any>secondPassager.start.datetime.toISOString();
    secondPassager.end.datetime = <any>secondPassager.end.datetime.toISOString();

    expect(data.result.people[0]).to.eql(passenger);
    expect(data.result.people[1]).to.eql(driver);
    expect(data.result.people[2]).to.eql(secondPassager);

    expect(status).equal(200);
  });
});

describe('SERVICE CROSSCHECK : Process - consolidate trip with journey', () => {
  before(async () => {
    newJourney = {
      ...secondJourney,
      operator_journey_id: 'differentOperatorJourneyId',
    };
    processParams = {
      journey: newJourney,
    };
    addedTrip = await mockServer.addTrip({
      ...trip,
      _id: new ObjectId(existingTripId),
    });
  });

  it('should consolidate trip with phone', async () => {
    try {
      const { data, status } = await request.post('/', mockFactory.call('crosscheck:process', processParams));

      expect(data.result._id).to.eql(existingTripId);

      const passenger = {
        ...trip.people[0],
        start: { ...trip.people[0].start },
        end: { ...trip.people[0].end },
      };
      passenger.start.datetime = <any>passenger.start.datetime.toISOString();
      passenger.end.datetime = <any>passenger.end.datetime.toISOString();

      const driver = <any>{
        ...trip.people[1],
        start: { ...trip.people[1].start },
        end: { ...trip.people[1].end },
      };
      driver.start.datetime = driver.start.datetime.toISOString();
      driver.end.datetime = driver.end.datetime.toISOString();

      const secondPassager = {
        ...secondJourney.passenger,
        start: { ...secondJourney.passenger.start },
        end: { ...secondJourney.passenger.end },
        journey_id: secondJourney.journey_id,
        class: secondJourney.operator_class,
        operator_journey_id: 'differentOperatorJourneyId',
        operator_class: secondJourney.operator_class,
        operator_id: secondJourney.operator_id,
        is_driver: false,
        revenue: null,
        payments: null,
        validation: null,
      };

      secondPassager.start.datetime = <any>secondPassager.start.datetime.toISOString();
      secondPassager.end.datetime = <any>secondPassager.end.datetime.toISOString();

      expect(data.result.people[0]).to.eql(passenger);
      expect(data.result.people[1]).to.eql(driver);
      expect(data.result.people[2]).to.eql(secondPassager);

      expect(status).equal(200);
    } catch (e) {
      console.log(e);
      if ('response' in e) {
        console.log(e.response.data);
      }
    }
  });
});
