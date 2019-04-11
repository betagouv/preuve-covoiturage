const _ = require('lodash');

/**
 * check existence and validate value
 *
 * @param obj
 * @param path
 * @returns {boolean}
 */
const strictHas = (obj, path) => _.has(obj, path)
  && _.get(obj, path, '') !== ''
  && !_.isNil(_.get(obj, path));

/**
 * check existence of lat + lng or insee
 *
 * @param obj
 * @param rad
 * @returns {boolean}
 */
const geoStrong = (obj, rad) => (strictHas(obj, `${rad}.lat`) && strictHas(obj, `${rad}.lng`)) || strictHas(obj, `${rad}.insee`);

module.exports = {
  async hasProofs(journey) {
    const proofs = _.get(journey.toObject(), 'proofs', []);

    return !!proofs.length;
  },

  async hasDriver(journey) {
    const driver = _.get(journey.toObject(), 'driver', []);
    return driver ? !!driver.length : false;
  },

  async hasOperator(journey) {
    return !!_.get(journey.toObject(), 'operator.siren', []).length;
  },

  async hasPassenger(journey) {
    const passenger = _.get(journey.toObject(), 'passenger', []).length;
    return passenger ? !!passenger.length : false;
  },

  async hasDriverOrPassenger(journey) {
    return this.hasDriver(journey) || this.hasPassenger(journey);
  },

  async hasDriverGeoStartStrong(journey) {
    return geoStrong(journey.driver, 'start');
  },

  async hasPassengerGeoStartStrong(journey) {
    return geoStrong(journey.passenger, 'start');
  },

  async hasDriverGeoEndStrong(journey) {
    return geoStrong(journey.driver, 'end');
  },

  async hasPassengerGeoEndStrong(journey) {
    return geoStrong(journey.passenger, 'end');
  },

  async hasDriverGeoStartWeak(journey) {
    return strictHas(journey.driver, 'start.literal');
  },

  async hasPassengerGeoStartWeak(journey) {
    return strictHas(journey.passenger, 'start.literal');
  },

  async hasDriverGeoEndWeak(journey) {
    return strictHas(journey.driver, 'end.literal');
  },

  async hasPassengerGeoEndWeak(journey) {
    return strictHas(journey.passenger, 'end.literal');
  },

  // eslint-disable-next-line no-unused-vars
  async deviceIsHuman(journey) {
    // if any of the proofs is declarative

    return true;
  },

  // eslint-disable-next-line no-unused-vars
  async deviceIsMachine(journey) {
    // if all proofs come from a device

    return true;
  },

  async errorDriverBelow18(journey) {
    if (!_.has(journey, 'driver')) return false;

    return journey.driver.over_18 === 'no';
  },

  // TODO
  // eslint-disable-next-line no-unused-vars
  async errorSpeeding(journey) {
    return false;
  },

  // TODO
  // eslint-disable-next-line no-unused-vars
  async errorDistanceTooBig(journey) {
    return false;
  },

  async errorTooManyPassengers(journey) {
    return journey.passengers_count > 8;
  },

};
