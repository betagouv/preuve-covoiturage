const _ = require('lodash');
const { Schema } = require('mongoose');
const { CsvConverter } = require('@pdc/journey-helpers');
const config = require('@pdc/config');
const aomService = require('../aom/aom-service');
const Journey = require('./journey-model');
const journeyEvents = require('./events');
const { isValidJourney, ...journeyValidationTests } = require('validation/service');
const { setClass, ...classTests } = require('class/service');



const journeyService = {

  async create(proof) {
    let journey = await Journey.find({journey_id: proof.journey_id, operator: { operator_id: proof.operator_id}})

    //todo: check if proof is not already in journey.proofs

    if (journey) {

      //ADD TO JOURNEY

      if (proof.is_driver) {

        journey.driver.append({
          driver_id: proof._id,
          start: proof.start,
          end: proof.end,
        });

      } else {

        journey.passengers.append({
          passenger_id: proof._id,
          start: PositionSchema,
          end: PositionSchema,
        });

      }


    } else {

      //CREATE JOURNEY

      journey = new Journey(
        {
          journey_id: proof.journey_id,
          operator: proof.operator,
          aom: proof.aom,
          trust_level: proof.trust_level,
          passengers_count: proof.passengers_count,
          validation: {
            validation_class: null,
          }
        }
      );


      if (proof.is_driver) {

        journey.driver.append({
          driver_id: proof._id,
          start: proof.start,
          end: proof.end,
        });

      } else {

        journey.passengers.append({
          passenger_id: proof._id,
          start: PositionSchema,
          end: PositionSchema,
        });

      }

    }

    journey.proofs.append(proof);
    await journey.save();
    journeyEvents.emit('change', journey.journey_id);
    return journey;
  },


  find(query = {}) {
    return Journey.find(query);
  },

  async update(id, data) {
    const journey = await Journey.findByIdAndUpdate(id, data, { new: true });

    journeyEvents.emit('change', journey.journey_id);
    return journey;
  },

  async delete(id) {
    return Journey.findByIdAndUpdate(id, { deletedAt: Date.now() });
  },

  async convert(docs, format = 'csv') {
    // convert to an array based on configuration file
    let arr = [];
    const journeys = docs.map((journey) => {
      arr = [];
      config.journeysCsv.headers.forEach((cfg) => {
        arr.push(_.get(journey, cfg.path, ''));
      });

      return arr;
    });

    // output in required format
    switch (format) {
      case 'csv':
        return (new CsvConverter(journeys, config.journeysCsv)).convert();

      default:
        throw new Error('Unsupported format');
    }
  },


  async validateClass(journey) {

    // run tests and order in list of testnames with results
    const validation = await Object.keys(classTests).reduce(async (list, k) => {
      // eslint-disable-next-line no-param-reassign
      list[_.snakeCase(k)] = await validationTests[k](journey);

      return list;
    }, {});

    // compute the validation state based on the results of
    // all tests
    const validationClass = setClass(validation);

    // find and update journey
    return Journey.findByIdAndUpdate(journey._id, {
      validation: {
        class_tests: validation,
        validation_class: validationClass,
      },
    }, {new: true});
  },



  async validate(journey) {
    // run tests and order in list of testnames with results
    const validation = await Object.keys(journeyValidationTests).reduce(async (list, k) => {
      // eslint-disable-next-line no-param-reassign
      list[_.snakeCase(k)] = await validationTests[k](journey);

      return list;
    }, {});

    // compute the validation state based on the results of
    // all tests
    const validated = isValidJourney(validation);

    // find and update journey
    return Journey.findByIdAndUpdate(journey._id, {
      validation: {
        validation_tests: validation,
        validated: validated,
        validatedAt: validated ? Date.now() : null,
      },
    }, {new: true});
  },


};

module.exports = journeyService;
