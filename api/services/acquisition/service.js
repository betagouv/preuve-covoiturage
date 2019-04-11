/* eslint-disable camelcase */
const _ = require('lodash');
const { ObjectId } = require('mongoose').Types;
const serviceFactory = require('@pdc/shared/packages/mongo/service-factory');
const NotFoundError = require('@pdc/shared/packages/errors/not-found');
const BadRequestError = require('@pdc/shared/packages/errors/bad-request');
const InternalServerError = require('@pdc/shared/packages/errors/internal-server');
const importer = require('@pdc/shared/packages/importer');
const Operator = require('@pdc/service-organization/entities/models/operator');
const operatorService = require('@pdc/service-organization/operator');
const tripService = require('@pdc/service-trip/service');
const Journey = require('./entities/models/journey');
const SafeJourney = require('./entities/models/safe-journey');
const { pathToPosition, findTown, findAomFromPosition } = require('./lib/position');
const validator = require('./entities/validation/validator');
const eventBus = require('../../events/bus');

const journeyService = serviceFactory(Journey, {
  async update(id, data) {
    const journey = await Journey.findByIdAndUpdate(id, data, { new: true }).exec();

    eventBus.emit('journey.update', journey);

    return journey;
  },

  async create(data, operator = null) {
    // store the journey in the safe collection
    // eslint-disable-next-line no-param-reassign
    if (operator) data.operator = operator;
    const journey = new SafeJourney(data);
    await journey.save();

    eventBus.emit('journey.create', { journey, operator });

    return journey;
  },

  /**
   * Duplicate a journey from 'safejourneys' collection to 'journeys'
   * for manipulation
   *
   * @param doc
   * @param operatorId
   * @returns {Promise<*>}
   */
  async duplicateFromSafe(doc, operatorId = null) {
    if (!doc) {
      throw new InternalServerError('Cannot duplicate null journey');
    }

    const journey = doc.toObject();

    if (!operatorId) {
      throw new NotFoundError('Operator must be defined');
    }

    const operator = await operatorService.findOne(operatorId);

    const dup = await (new Journey(Object.assign(
      Object.create(null),
      _.omit(journey, ['_id', 'createdAt', 'updatedAt', '__v']),
      {
        safe_journey_id: journey._id,
        operator,
      },
    ))).save();

    // mark safe journey as duplicated
    SafeJourney
      .findByIdAndUpdate(journey._id, { duplicatedAt: new Date() })
      .exec();

    return dup;
  },

  async fillOutCoordinates(j) {
    const journey = j.toObject();

    return Promise.all([
      'passenger.start',
      'passenger.end',
      'driver.start',
      'driver.end',
    ].map(async path => Promise
      .resolve({ journey, path })
      .then(pathToPosition)
      .then(findTown)
      // .then(findTownByInsee)
      .then(findAomFromPosition)
      .then(({ position }) => position)))

    // Filter ou duplicates and null
      .then((positions) => {
        const idTrack = [];
        const aomsClean = positions
        // concat existing and new AOM in an array
          .reduce((p, position) => p.concat(position.aom || []), journey.aom || [])
          // filter out duplicates and null
          .filter((aom) => {
            if (!aom || !aom._id) return false;
            if (idTrack.indexOf(aom._id.toString()) > -1) return false;
            idTrack.push(aom._id.toString());
            return true;
          });

        _.set(journey, 'aom', aomsClean);
      })

      // save the updated journey
      // ! journey.save() fails here ;(
      .then(() => {
        if (!journey || !journey._id) throw new Error(`FAIL ${journey._id}`);
        return Journey.findOneAndUpdate(
          { _id: journey._id },
          _.omit(journey, [
            '_id',
            '__v',
            'createdAt',
            'updatedAt',
            'safe_journey_id',
            'validation',
          ]),
          { new: true },
        ).exec();
      });
  },

  async validate(journey, step = 0) {
    // run tests and order in list of testnames with results
    const results = await validator.process(journey);

    // compute the rank
    const rank = validator.calcRank(results);

    // compute the validation state based on the results of all tests
    const validated = validator.isValid(results);

    // find and update journey
    const updated = await Journey.findByIdAndUpdate(journey._id, {
      validation: {
        validated,
        tests: results,
        rank,
        step,
        validatedAt: validated ? Date.now() : null,
      },
    }, { new: true }).exec();

    eventBus.emit('journey.validate', updated.toObject());

    return updated;
  },

  /**
   * @param {Object} fields
   * @param {MulterFile} file
   * @returns {Promise<void>}
   */
  async import({ operator }, file) {
    const lines = importer.read(file);

    importer.validate(file, lines);

    if (!operator || !_.isString(operator)) {
      throw new BadRequestError('Operator must be an ID');
    }

    const op = await Operator.findOne(ObjectId(operator.toString())).exec();

    if (!op) {
      throw new NotFoundError('Wrong Operator');
    }

    return importer.exec(journeyService, op, lines);
  },

  async process({ safe_journey_id }) {
    // search for the matching journey
    const journey = await Journey
      .findOne({ safe_journey_id: ObjectId(safe_journey_id) })
      .exec();

    if (journey) {
      if (journey.status === 'processed') {
        throw new Error('Journey is already processed');
      }

      // delete previous journey
      await Journey.findByIdAndDelete(journey._id).exec();
    }

    // get the safe journey to duplicate it again
    const safeJourney = await SafeJourney
      .findOne({ _id: ObjectId(safe_journey_id) })
      .exec();

    if (!safeJourney) {
      throw new NotFoundError(`SafeJourney not found: ${safe_journey_id}`);
    }

    if (!safeJourney.operator) {
      throw new BadRequestError('SafeJourney missing operator');
    }

    let duplicate = await this.duplicateFromSafe(safeJourney, safeJourney.operator._id);

    // fill-out missing coordinates and bind AOMs
    duplicate = await this.fillOutCoordinates(duplicate);

    // consolidate trips
    await tripService.consolidate(duplicate);

    // run all steps sequentially
    duplicate = await this.validate(duplicate, 0);
    duplicate = await this.validate(duplicate, 1);
    duplicate = await this.validate(duplicate, 2);

    return duplicate;
  },
});

module.exports = journeyService;
