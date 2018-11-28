const _ = require('lodash');
const Journey = require('./journey-model');
const eventBus = require('../events/bus');
const validator = require('./validation/validator');

const journeyService = {

  // async create(proof) {
  //   console.log('create');
  //   // try{
  //   let journey = await Journey.find(
  //     {
  //       journey_id: proof.journey_id,
  //       // "operator.operator_id": proof.operator_id todo: not working
  //     },
  //   );
  //   // }
  //   // catch(e) {
  //   //   console.log(e)
  //   //   debugger;
  //   // }
  //
  //   console.log('journey', journey, journey.length);
  //   // todo: check if proof is not already in journey.proofs
  //
  //   if (journey.length > 0) {
  //     // ADD TO JOURNEY
  //     console.log('add to journey');
  //     if (proof.is_driver) {
  //       journey.driver.append({
  //         driver_id: proof._id,
  //         start: proof.start,
  //         end: proof.end,
  //       });
  //     } else {
  //       journey.passengers.append({
  //         passenger_id: proof._id,
  //         start: PositionSchema,
  //         end: PositionSchema,
  //       });
  //     }
  //   } else {
  //     // CREATE JOURNEY
  //     console.log('create journey');
  //     journey = new Journey(
  //       {
  //         journey_id: proof.journey_id,
  //         operator: proof.operator,
  //         aom: proof.aom,
  //         trust_level: proof.trust_level,
  //         passengers_count: proof.passengers_count,
  //         validation: {
  //           validation_class: null,
  //         },
  //       },
  //     );
  //     if (proof.is_driver) {
  //       journey.driver.append({
  //         driver_id: proof._id,
  //         start: proof.start,
  //         end: proof.end,
  //       });
  //     } else {
  //       journey.passengers.append({
  //         passenger_id: proof._id,
  //         start: PositionSchema,
  //         end: PositionSchema,
  //       });
  //     }
  //   }
  //   journey.proofs.append(proof);
  //   await journey.save();
  //   journeyEvents.emit('change', journey.journey_id);
  //   return journey;
  // },

  find(query = {}) {
    return Journey.find(query);
  },

  async upsert(proof) {
    // find or create the journey
    let journey = await Journey.findOne({ journey_id: proof.journey_id });
    if (!journey) {
      journey = new Journey({ journey_id: proof.journey_id });
    }

    eventBus.emit('journey.upsert', journey.addProof(proof));

    return journey;
  },

  async update(id, data) {
    const journey = await Journey.findByIdAndUpdate(id, data, { new: true });

    eventBus.emit('journey.update', journey);

    return journey;
  },

  async create(data) {
    const journey = new Journey(data);
    await journey.save();

    eventBus.emit('journey.create', journey);

    return journey;
  },

  async delete(id) {
    eventBus.emit('journey.delete', id);

    return Journey.findByIdAndUpdate(id, { deletedAt: Date.now() });
  },

  async validate(journey) {
    // run tests and order in list of testnames with results
    const results = await validator.process(journey);

    // compute the rank
    const rank = validator.calcRank(results);

    // compute the validation state based on the results of all tests
    const validated = validator.isValid(results, rank);

    // find and update journey
    return Journey.findByIdAndUpdate(journey._id, {
      validation: {
        validated,
        tests: results,
        rank,
        validatedAt: validated ? Date.now() : null,
      },
    }, { new: true });
  },
};

module.exports = journeyService;
