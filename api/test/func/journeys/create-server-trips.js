/* eslint-disable global-require */

const _ = require('lodash');
const supertest = require('supertest');
const faker = require('faker');
const app = require('@pdc/proxy/app');
const { assertResponse } = require('@pdc/shared-helpers').test;
const insee = require('../../data/insee');
const { signin } = require('../../lib/signin');
const tripGenerator = require('../../data/journeys/trip');

const request = supertest(app);

describe('Trips', () => {
  const storage = {
    operatorId: null,
    appId: null,
    appToken: null,
    user: null,
  };

  before(async () => {
    storage.user = await signin({
      email: 'operator@example.com',
      password: 'operator',
    });
  });

  it('POST /operators/applications :: Create', async () => request
    .post('/operators/applications')
    .send({
      name: 'Dummy Application',
    })
    .set('Authorization', `Bearer ${storage.user.token}`)
    .set('accept', 'json')
    .expect(assertResponse(201, {
      app(appId) {
        storage.appId = appId;
        return true;
      },
      token(appToken) {
        storage.appToken = appToken;
        return true;
      },
    })));

  it('POST /journeys/push :: generate couples', async () => {
    const operatorJourneyId = faker.random.uuid();
    const driver = {
      identity: {
        firstname: faker.name.firstName(),
        lastname: faker.name.lastName(),
        phone: faker.phone.phoneNumber(),
      },
      start: {
        datetime: faker.date.past(),
        insee: faker.helpers.randomize(insee),
      },
      end: {
        datetime: faker.date.past(),
        insee: faker.helpers.randomize(insee),
      },
      cost: faker.random.number({ min: 0, max: 20, precision: 2 }),
      distance: faker.random.number({ min: 0, max: 50000 }),
      duration: faker.random.number({ min: 0, max: 7200 }),
    };

    const exec = async () => {
      try {
        let safeId = null;

        await request
          .post('/journeys/push')
          .send(tripGenerator(operatorJourneyId, { driver }))
          .set('Authorization', `Bearer ${storage.appToken}`)
          .set('accept', 'json')
          .expect(async (res) => {
            if (!_.get(res, 'body.payload.data.id')) {
              throw new Error(`ERROR: ${_.get(res, 'body.message', '')}`);
            }

            safeId = _.get(res, 'body.payload.data._id');
          });

        if (!safeId) return false;

        const { ObjectId } = require('mongoose').Types;
        const { SafeJourney } = require('@pdc/service-acquisition').acquisition.entities.models;
        const { journeyService } = require('@pdc/service-acquisition').acquisition;
        const { tripService } = require('@pdc/service-trip').trip;

        const safe = await SafeJourney.findOne({ _id: ObjectId(safeId) }).exec();
        // console.log(safe ? safe.toObject().operator : safe);
        const safed = await journeyService.duplicateFromSafe(safe, safe.operator._id);
        // console.log(safed ? safed.toObject().operator : safed);
        const safec = await journeyService.fillOutCoordinates(safed);
        // console.log(safec ? safec.toObject().operator : safec);
        const trip = await tripService.consolidate(safec);
        // console.log(trip ? `people ${trip.toObject().people.length}` : trip);

        return trip;
      } catch (e) {
        // console.log(e.message);
        return null;
      }
    };

    await exec();
    await exec();
    await exec();
    await exec();
  });
});
